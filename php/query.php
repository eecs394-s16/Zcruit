<?php
$conn = mysqli_connect("localhost","bpeynetti","","zcruit");

if (mysqli_connect_errno($conn))
{
   echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$query = $_GET['query'];

if (stripos($query, "drop") !== false || stripos($query, "select") === false) {
  echo "Don't be bad";
  return;
}

$result_arr = array();

$query_result = mysqli_query($conn, $query);

if ($query_result) {
  while ($row = mysqli_fetch_assoc($query_result)) {
    array_push($result_arr, $row);
  }
  echo json_encode($result_arr);
} else {
  echo "Query failed!";
}

$conn->close();
?>