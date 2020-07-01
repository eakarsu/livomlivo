CREATE KEYSPACE IF NOT EXISTS security WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

CREATE TABLE IF NOT EXISTS security.users (id text, mail text, first_name text, last_name text, password text, password_salt text, active boolean, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS security.user_groups (name text, description text, user_ids set<text>, PRIMARY KEY (name));

INSERT INTO security.users (id, mail, first_name, last_name, active, password, password_salt) VALUES ('user1', 'user1@example.com', 'John', 'Doe', false, NULL, NULL);
INSERT INTO security.users (id, mail, first_name, last_name, active, password, password_salt) VALUES ('user2', 'user2@example.com', 'John', 'Doey', true, NULL, NULL);
INSERT INTO security.users (id, mail, first_name, last_name, active, password, password_salt) VALUES ('user3', 'user3@example.com', 'Johnny', 'Doe', false, NULL, NULL);

INSERT INTO security.user_groups (name, description, user_ids) VALUES ('group1', null, {'user1', 'user2'});
INSERT INTO security.user_groups (name, description, user_ids) VALUES ('group2', null, {'user2'});
INSERT INTO security.user_groups (name, description, user_ids) VALUES ('group3', null, {'user1', 'user2', 'user3'});
INSERT INTO security.user_groups (name, description, user_ids) VALUES ('group4', null, null);
