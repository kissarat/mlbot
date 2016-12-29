CREATE TABLE contact (
  id      INT PRIMARY KEY,
  account VARCHAR(64) NOT NULL,
  login   VARCHAR(64) NOT NULL,
  name    VARCHAR(64) NOT NULL,
  UNIQUE (account, login)
);

CREATE TABLE message_type (
  id   INT PRIMARY KEY,
  name VARCHAR(64) NOT NULL
);

INSERT INTO message_type VALUES
  (0, 'plain'),
  (1, 'invite');

CREATE TABLE message (
  id   INT PRIMARY KEY,
  text TEXT NOT NULL,
  type INT REFERENCES message_type (id)
);

CREATE TABLE task_status (
  id   INT PRIMARY KEY,
  name VARCHAR(64) NOT NULL
);

INSERT INTO task_status VALUES
  (0, 'created'),
  (1, 'invited'),
  (2, 'send');

CREATE TABLE task (
  id      INT PRIMARY KEY,
  contact INT REFERENCES contact (id),
  message INT REFERENCES message (id),
  status  INT REFERENCES task_status (id)
);
