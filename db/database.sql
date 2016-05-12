
-- create database zcruit;
use zcruit;

create table Players (
  Player_id INT PRIMARY KEY AUTO_INCREMENT,
  FirstName VARCHAR(100),
  LastName VARCHAR(100),
  
  Height FLOAT,
  Weight FLOAT,
  Year INT,
  
  Img_url VARCHAR(300),
  
  AreaCoach_id INT,
  
  GPA FLOAT,
  HighSchool_id INT,
  Hometown_city VARCHAR(50),
  Hometown_state VARCHAR(3),
  Hometown_zip INT,
  Phone INT,
  Email VARCHAR(50),
  Address VARCHAR(100),
  Parent1 VARCHAR(100),
  Parent2 VARCHAR(100),
  Legacy INT,
  Sibling INT,
  
  Zscore INT,
  NU_status INT

-- Schools_admitted VARCHAR(300)
);

create table HighSchools 
(
  HS_id INT PRIMARY KEY AUTO_INCREMENT,
  HS_name VARCHAR(200),
  HS_city VARCHAR(200),
  HS_zip INT,
  HS_state VARCHAR(3),
  HS_phone INT
);

create table Coaches
(
  Coach_id INT PRIMARY KEY AUTO_INCREMENT,
  Coach_name VARCHAR(100),
  Coach_superior_id INT,
  Coach_type VARCHAR(20),
  Coach_specialty VARCHAR(20)
);


create table Positions
(
  Pos_id INT PRIMARY KEY AUTO_INCREMENT,
  Player_id INT,
  Position_type VARCHAR(30),
  Position_name VARCHAR(100),
  Position_rank INT
);


create table Colleges
(
  College_id INT PRIMARY KEY AUTO_INCREMENT,
  College_name VARCHAR(100),
  College_logo_url VARCHAR(200)
);

create table College_status
(
  College_id INT,
  Player_id INT,
  Status INT,
  CONSTRAINT college_status_id PRIMARY KEY (College_id,Player_id)
);
