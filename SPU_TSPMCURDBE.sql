CREATE OR REPLACE FUNCTION dbo."SPU_TSPMCURDBE" (
    "PS_CODSPM" character varying,
    "PS_NEWCUR" character varying,
    "PS_RATMDF" numeric,
    "PS_CODUSR" integer,
    "PS_COMCUR" text,
    "PS_CF_LEVEL" character varying,
    "PS_CODSTATUS" integer,
    "PS_ONLY_CURRENCY" boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql AS $function$
DECLARE
    OLDCUR VARCHAR(3);
    CODFILE NUMERIC(7,0);
    CODRIA int;
    CODOC VARCHAR(10);
    CODCOM NUMERIC(8,0);
    CRARRAY int[];
    CRIA int;
    EXCHRATE DOUBLE PRECISION;
BEGIN
    IF EXISTS(SELECT FROM "dbo"."TSPMDBE" 
             WHERE "CODSPM" = "PS_CODSPM" 
             AND "CODLEVEL" = "PS_CF_LEVEL" 
             AND "FLAG" = 'Y') THEN

        SELECT "CODCUR" INTO OLDCUR 
        FROM "dbo"."TSPMDBE" 
        WHERE "CODSPM" = "PS_CODSPM"
        AND "CODLEVEL" = "PS_CF_LEVEL"
        AND "FLAG" = 'Y';

        -- Update TSPMDBE
        UPDATE "dbo"."TSPMDBE"
        SET "CODCUR" = "PS_NEWCUR"
        WHERE "CODSPM" = "PS_CODSPM"
        AND "CODLEVEL" = "PS_CF_LEVEL"
        AND "FLAG" = 'Y';

        -- Update for SGR level
        IF "PS_CF_LEVEL" = 'SGR' THEN
            UPDATE "dbo"."TSPMDBE"
            SET "CODCUR" = "PS_NEWCUR" 
            WHERE "CODSPM1" = "PS_CODSPM" 
            AND "CODLEVEL" = 'LE' 
            AND "FLAG" = 'Y';
        END IF;

        -- Update credit file
        UPDATE "dbo"."TCDTFILEDBE"
        SET "CODCUR" = "PS_NEWCUR"
        WHERE "CODSPM" = "PS_CODSPM" 
        AND "CODSTATUS" = "PS_CODSTATUS" 
        AND "FLAG" = 'Y';

        -- Calculate exchange rate
        EXCHRATE := ((SELECT "EXCHRATE" 
                     FROM "dbo"."TEXCHANGERATEDBE" 
                     WHERE "CODCUR" = OLDCUR
                     AND "MESCODCUR" = 'EUR') /
                    (SELECT "EXCHRATE" 
                     FROM "dbo"."TEXCHANGERATEDBE" 
                     WHERE "CODCUR" = "PS_NEWCUR" 
                     AND "MESCODCUR" = 'EUR'));

        -- Update quantities only if not currency-only mode
        IF NOT "PS_ONLY_CURRENCY" THEN
            -- Update TSPMDBE quantities
            UPDATE "dbo"."TSPMDBE"
            SET "EQTY" = "EQTY"/EXCHRATE,
                "DATVALEQTY" = now()
            WHERE "CODSPM" = "PS_CODSPM" 
            AND "CODLEVEL" = "PS_CF_LEVEL" 
            AND "FLAG" = 'Y';

            IF "PS_CF_LEVEL" = 'SGR' THEN
                UPDATE "dbo"."TSPMDBE"
                SET "EQTY" = "EQTY"/EXCHRATE
                WHERE "CODSPM1" = "PS_CODSPM" 
                AND "CODLEVEL" = 'LE'
                AND "FLAG" = 'Y';
            END IF;
        END IF;

        -- Insert audit record
        INSERT INTO "dbo"."TCURAUDDBE"
        SELECT "PS_CODSPM", "PS_CF_LEVEL", "PS_NEWCUR", 
               LOCALTIMESTAMP, OLDCUR, EXCHRATE, 
               "PS_CODUSR", "PS_COMCUR";

        -- Handle credit file updates
        IF EXISTS(SELECT FROM "dbo"."TCDTFILEDBE" 
                 WHERE "CODSPM" = "PS_CODSPM" 
                 AND "CODSTATUS" = "PS_CODSTATUS" 
                 AND "FLAG" = 'Y') THEN
            
            SELECT "CODFILE" INTO CODFILE 
            FROM "dbo"."TCDTFILEDBE"
            WHERE "CODSPM" = "PS_CODSPM"
            AND "CODSTATUS" = "PS_CODSTATUS"
            AND "FLAG" = 'Y';

            IF "PS_CODSTATUS" = 26 AND NOT "PS_ONLY_CURRENCY" THEN
                FOR CRIA IN SELECT "CODRIA" 
                           FROM "dbo"."TRIADBE"
                           WHERE "CODFILE" = CODFILE
                           AND "CODSTATUS" IN (19,15)
                           AND "FLAG" = 'Y'
                           GROUP BY "CODRIA" LOOP
                    
                    SELECT MAX("CODCOM")+1 INTO CODCOM 
                    FROM "dbo"."TCOMMENTDBE";

                    INSERT INTO "dbo"."TCOMMENTDBE"
                    ("FLAG", "CODCOM", "CODUSER", "CODTYPE", "CODOC", 
                     "CODRIA", "DATCOM", "FLAGNOTIF")
                    VALUES('Y', CODCOM, "PS_CODUSR", 'EXT', '3000315058',
                          CRIA, LOCALTIMESTAMP, 'N');

                    UPDATE "dbo"."TCOMMENTDBE"
                    SET "COMMENT" = convert_from(decode("PS_COMCUR", 'base64'), 'UTF8')
                    WHERE "CODOC" = '3000315058';
                END LOOP;
            END IF;

            -- Insert into log table
            INSERT INTO "dbo"."TMODCURLOGDBE"
            ("CODFILE", "CODSPM", "CF_LEVEL", "CODRIA", "OLDCUR", 
             "NEWCUR", "EXCHRATE", "CODSTATUS", "CREATEDDATE", "CREATEDBY")
            VALUES (CODFILE, "PS_CODSPM", "PS_CF_LEVEL", 
                   CASE WHEN "PS_CODSTATUS" = 26 THEN CRARRAY ELSE CODFILE END,
                   OLDCUR, "PS_NEWCUR", EXCHRATE, "PS_CODSTATUS", 
                   NOW(), "PS_CODUSR");
        END IF;
    END IF;
END;
$function$;
