
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS users;

CREATE TABLE companies (
    handle TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT,
    CONSTRAINT num_employees_check CHECK ((num_employees >= 0))
);

CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary FLOAT NOT NULL,
    equity FLOAT NOT NULL,
    company_handle TEXT NOT NULL,
    date_posted DATE DEFAULT DATE(CURRENT_TIMESTAMP),
    CONSTRAINT fk_company_handle 
        FOREIGN KEY(company_handle) 
        REFERENCES companies(handle)
        ON DELETE CASCADE,
    CONSTRAINT equity_check 
        CHECK ((equity BETWEEN 0 AND 1))
);

CREATE TABLE users (
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO companies (handle, name, num_employees, description, logo_url)
VALUES ('rey', 'Rey Inc.', 1, 'Company of goodest doggo in the world', 'https://www.rey.com/');

INSERT INTO jobs (title, salary, equity, company_handle)
VALUES ('scratcher', 100, 0.1, 'rey');