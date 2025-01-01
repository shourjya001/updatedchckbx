function fetchCFdetails() {
    $searchString = $_REQUEST['searchString'];
    $codstatus = $_REQUEST['codstatus'] != '' ? $_REQUEST['codstatus'] : '25,26';
    $isOnlyCurrency = isset($_REQUEST['isOnlyCurrency']) ? $_REQUEST['isOnlyCurrency'] : false;
    
    if ($searchString != '') {
        $OcQuery = "SELECT \"CODSPM\", \"CODFILE\", \"CODCUR\", \"CODSTATUS\" 
                    FROM \"TCDTFILEDBE\" 
                    WHERE \"CODSPM\" = '$searchString' 
                    AND \"FLAG\" = 'Y' 
                    AND \"CODSTATUS\" IN($codstatus)
                    ORDER BY \"CODSTATUS\" DESC";
        
        $OcResult = pg_query($OcQuery);
        $OcResultRow = pg_fetch_all($OcResult);
        
        echo $OcResultRow ? json_encode($OcResultRow) : '{"id": "None"}';
    }
}
