function saveCurrency() {
    $lastComment = base64_encode($_POST['closeComment']);
    $CF_Level = $_POST['CF_Level'];
    $codusr = $_POST['codUsr'];
    $sub_group_code = isset($_POST['sub_group_code']) ? trim($_POST['sub_group_code']) : trim($_POST['le_code']);
    $txtrate = isset($_POST['txtrate']) ? $_POST['txtrate'] : 0;
    $curr = $_POST['newcurrency'];
    $creditfile_type = $_POST['codtype_cdt'];
    $isOnlyCurrency = isset($_POST['isOnlyCurrency']) && $_POST['isOnlyCurrency'] === 'true';
    
    if ($sub_group_code != '') {
        // Always update currency
        $query_Line = "SELECT FROM dbo.\"SPU_TSPMCURDBE\"(
            '$sub_group_code', 
            '$curr', 
            '$txtrate', 
            $codusr, 
            '$lastComment', 
            '$CF_Level', 
            $creditfile_type,
            $isOnlyCurrency
        )";
        $result_Line = pg_query($query_Line);
        
        // Update limits only if not currency-only mode
        if (!$isOnlyCurrency) {
            $query_Line2 = "SELECT FROM dbo.\"SPU_LIMITS_TLINERIADBE\"(
                '$sub_group_code', 
                $creditfile_type, 
                $codusr
            )";
            $result_Line2 = pg_query($query_Line2);
            echo ($result_Line && $result_Line2) ? '{"id":"success"}' : '{"id":"fail"}';
        } else {
            echo $result_Line ? '{"id":"success"}' : '{"id":"fail"}';
        }
    } else {
        echo '{"id":"fail"}';
    }
}
