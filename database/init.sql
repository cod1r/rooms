CREATE TABLE IF NOT EXISTS Users (
	ID INT auto_increment NOT NULL,
	email varchar(500) NULL,
    username varchar(500) NOT NULL UNIQUE,
    password varchar(500) NOT NULL UNIQUE,
    bio BLOB NULL
);
CREATE TABLE IF NOT EXISTS Rooms (
	Owner INT auto_increment NOT NULL,
    RoomName varchar(500) NOT NULL UNIQUE,
    RoomType INT NOT NULL
);