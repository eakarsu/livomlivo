CREATE KEYSPACE IF NOT EXISTS security WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

CREATE TABLE IF NOT EXISTS security.users (id text, mail text, first_name text, last_name text, password text, password_salt text, active boolean, PRIMARY KEY (id));

INSERT INTO security.users (id, mail, first_name, last_name, active, password, password_salt) VALUES ('someuser', 'someuser@example.com', 'John', 'Doe', false, 'f73736b70bd593eb66120dafe13f4ec8f7a6a0d7fefc4bf8a0421b98e1d64f6cf1198757970642f7f1032ce5a92a89add8dfeff1017a607cff84b99c49115efb', '87404d4e6a79a48f632ae8ef1485907d');
