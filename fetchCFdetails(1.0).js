function fetchCFdetails() {
    $searchString = $_REQUEST['searchString'];
    $codstatus = $_REQUEST['codstatus'] != '' ? $_REQUEST['codstatus'] : '25,26';
    $isOnlyCurrency = isset($_REQUEST['isOnlyCurrency']) && $_REQUEST['isOnlyCurrency'] === 'true';
    
    if ($searchString != '') {
        // Modified query to handle currency-only case
        $OcQuery = "SELECT DISTINCT \"CODSPM\", \"CODFILE\", \"CODCUR\", \"CODSTATUS\" 
                    FROM \"TCDTFILEDBE\" t1
                    WHERE \"CODSPM\" = '$searchString' 
                    AND \"FLAG\" = 'Y' 
                    AND \"CODSTATUS\" IN($codstatus)";
                    
        if (!$isOnlyCurrency) {
            $OcQuery .= " AND EXISTS (
                SELECT 1 FROM \"TLINERIADBE\" t2 
                WHERE t2.\"CODFILE\" = t1.\"CODFILE\"
                AND t2.\"FLAG\" = 'Y'
            )";
        }
        
        $OcQuery .= " ORDER BY \"CODSTATUS\" DESC";
        
        $OcResult = pg_query($OcQuery);
        $OcResultRow = pg_fetch_all($OcResult);
        
        echo $OcResultRow ? json_encode($OcResultRow) : '{"id": "None"}';
    }
}
