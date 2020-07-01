CREATE KEYSPACE IF NOT EXISTS analytics WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

CREATE TABLE IF NOT EXISTS analytics.events (id text, name text, start_time bigint, end_time bigint, parameters map<text,text>, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS analytics.errors (id text, message text, time bigint, parameters map<text,text>, PRIMARY KEY (id, time));
CREATE TABLE IF NOT EXISTS analytics.reports (name text, time bigint, period int, data blob, PRIMARY KEY (name, period));
CREATE TABLE IF NOT EXISTS analytics.user_preferences (company_id text, user_principal text, opted_in boolean, PRIMARY KEY (company_id, user_principal));

CREATE INDEX IF NOT EXISTS event_name ON analytics.events (name);
CREATE INDEX IF NOT EXISTS report_time ON analytics.reports (time);

INSERT INTO analytics.user_preferences (company_id, user_principal, opted_in) VALUES ('company1', 'user1', true);
INSERT INTO analytics.user_preferences (company_id, user_principal, opted_in) VALUES ('company3', 'user3', false);

INSERT INTO analytics.reports (name, time, period, data) VALUES ('Report1', null, 3, null);
INSERT INTO analytics.reports (name, time, period, data) VALUES ('Report2', 1296691200000, 1, null);
