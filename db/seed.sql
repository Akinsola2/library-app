INSERT INTO authors (name) VALUES
  ('Chinua Achebe'),
  ('Jane Austen'),
  ('George Orwell'),
  ('J. R. R. Tolkien'),
  ('Agatha Christie');

INSERT INTO books (title, year, author_id)
SELECT seed.title, seed.publication_year, authors.id
FROM (
  VALUES
    ('Things Fall Apart', 1958, 'Chinua Achebe'),
    ('No Longer at Ease', 1960, 'Chinua Achebe'),
    ('Pride and Prejudice', 1813, 'Jane Austen'),
    ('Emma', 1815, 'Jane Austen'),
    ('Nineteen Eighty-Four', 1949, 'George Orwell'),
    ('Animal Farm', 1945, 'George Orwell'),
    ('The Hobbit', 1937, 'J. R. R. Tolkien'),
    ('The Fellowship of the Ring', 1954, 'J. R. R. Tolkien'),
    ('Murder on the Orient Express', 1934, 'Agatha Christie'),
    ('And Then There Were None', 1939, 'Agatha Christie')
) AS seed(title, publication_year, author_name)
JOIN authors ON authors.name = seed.author_name;

INSERT INTO members (name, phone) VALUES
  ('Bola Ade', NULL),
  ('Tunde Okafor', NULL),
  ('Adaeze Bello', NULL),
  ('Chika Nwosu', NULL),
  ('Femi Adebayo', NULL);

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT books.id, members.id, CURRENT_DATE, CURRENT_DATE + 14, NULL
FROM (
  VALUES
    ('Things Fall Apart', 'Chinua Achebe', 'Bola Ade'),
    ('The Hobbit', 'J. R. R. Tolkien', 'Tunde Okafor')
) AS seed(book_title, author_name, member_name)
JOIN authors ON authors.name = seed.author_name
JOIN books ON books.title = seed.book_title AND books.author_id = authors.id
JOIN members ON members.name = seed.member_name;

INSERT INTO loans (book_id, member_id, borrowed_on, due_on, returned_on)
SELECT books.id, members.id, CURRENT_DATE - 21, CURRENT_DATE - 7, CURRENT_DATE - 14
FROM authors
JOIN books ON books.author_id = authors.id
JOIN members ON members.name = 'Adaeze Bello'
WHERE authors.name = 'Jane Austen'
  AND books.title = 'Pride and Prejudice';
