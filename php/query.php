<?php
header('Access-Control-Allow-Origin: *');
$conn = mysqli_connect("localhost","bpeynetti","","zcruit");

if (mysqli_connect_errno($conn))
{
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$query = $_GET['query'];

if (stripos($query, "drop") !== false || (stripos($query, "select") === false && stripos($query, "insert") === false && stripos($query, "update") === false)) {
  echo "Don't be bad";
  http_response_code(500);
  return;
}

$result_arr = array();

$query_result = mysqli_query($conn, $query);

if ($query_result) {
  // Return if query isn't a SELECT
  if ($query_result === true) {
    return;
  }

  while ($row = mysqli_fetch_assoc($query_result)) {
    array_push($result_arr, $row);
  }
  echo json_encode($result_arr);
} else {
  echo "Query failed!";
  http_response_code(500);
}

$conn->close();
?>
