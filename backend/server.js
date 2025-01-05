const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const SECRET_KEY ='iwhirwaho'; 

app.use(cors({
  origin: '*', // Adjust this to your frontend's origin for better security
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'tutorialdb',
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to MySQL database');
});

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access denied: Token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

app.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Hash the password before storing it
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Server error: Could not process password' });
    }

    const sql = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, hashedPassword, role], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error: Could not register user' });
      }
      return res.status(201).json({ message: 'User registered successfully' });
    });
  });
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Retrieve user from the database
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result[0];

    try {
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Generate a JWT token with role included
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        return res.status(200).json({ message: 'Login successful', token });
      } else {
        return res.status(401).json({ error: 'Invalid password' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
});

app.get('/users', authenticate, (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(result);
  });
});


app.get('/faculties',authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Get token from header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // You might want to validate the token here...

    // Fetch faculties (teachers) from the users table
    const sql = 'SELECT id, name FROM users WHERE role = "teacher"';
    const faculties = await dbQuery(sql); // Assuming dbQuery is your helper function for queries
    res.json(faculties); // Send the list of teachers as a response
  } catch (error) {
    console.error('Error fetching faculties:', error.message);
    res.status(500).json({ message: 'Error fetching faculties' });
  }
});

app.get('/studentslist',authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Get token from header
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // You might want to validate the token here...

    // Fetch faculties (teachers) from the users table
    const sql = 'SELECT * FROM users WHERE role = "student"';
    const students = await dbQuery(sql); // Assuming dbQuery is your helper function for queries
    res.json(students); // Send the list of teachers as a response
  } catch (error) {
    console.error('Error fetching students:', error.message);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

app.get('/api/user/profile', authenticate, (req, res) => {
  const userEmail = req.user.email;  // Extract email from the decoded token

  // Query to fetch user profile data by email
  const sql = 'SELECT name, email, role FROM users WHERE email = ?';
  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the user profile data as response
    const user = result[0];
    return res.status(200).json({
      email: userEmail,
      name: user.name,
      role: user.role,
    });
  });
});
app.get('/classes',authenticate, (req, res) => {
  const sql = 'SELECT * FROM classes'; // Query to get all classes
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(result);
  });
});
app.get('/class/:classId', authenticate, (req, res) => {
  const { classId } = req.params;
  
  const sql = 'SELECT semester, department, program FROM classes WHERE Id = ?'; // Assuming 'Id' is the column for class ID
  db.query(sql, [classId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    return res.status(200).json(result[0]); // Send the class name
  });
});
app.get('/subjects', authenticate, (req, res) => {
  const { classId } = req.query; // Get classId from query params

  if (!classId) {
    return res.status(400).json({ error: 'Class ID is required' });
  }
  const sql = 'SELECT * FROM subject WHERE classId = ?'; // Query by classId
  db.query(sql, [classId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No subjects found for this class' });
    }

    return res.status(200).json(result);
  });
});

app.get('/students/:classid', authenticate, (req, res) => {
  const { classid } = req.params; // Get classid from URL params
  
  // SQL query to get students based on classId
  const sql = 'SELECT * FROM users WHERE class_id = ?'; // Adjust the table and field names as per your database
  
  db.query(sql, [classid], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'No students found for this class' });
    }
    // Return the list of students
    return res.status(200).json(result);
  });
});

app.get('/subjects/:subjectId', authenticate, (req, res) => {
  const { subjectId } = req.params; // Get subjectId from URL params
  const sql = 'SELECT * FROM subject WHERE Id = ?'; // Assuming 'Id' is the column for subject ID
  db.query(sql, [subjectId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }
    return res.status(200).json(result[0]); // Send the subject data
  });
});

app.get('/attendances/:classid/:lectureId', authenticate, (req, res) => {
  const { classid, lectureId } = req.params;

  const sql = `
    SELECT * FROM attendance 
    WHERE classId = ? AND lectureId = ?`;

  db.query(sql, [classid, lectureId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Could not fetch attendance data' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    return res.status(200).json(result);
  });
});

app.get('/attendances/:classid/:lectureId', authenticate, (req, res) => {
  const { classid, lectureId } = req.params;

  const sql = `
    SELECT * FROM attendance 
    WHERE classId = ? AND lectureId = ?`;

  db.query(sql, [classid, lectureId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Could not fetch attendance data' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    return res.status(200).json(result);
  });
});

app.get('/lectures', authenticate, (req, res) => {
  const { subjectId } = req.query; // Get subjectId from query params

  // Fetch lectures based on subjectId
  const sql = 'SELECT l.*, s.subjectName FROM lectures l INNER JOIN subject s ON l.subjectId = s.Id WHERE l.subjectId = ?';
  db.query(sql, [subjectId], (err, result) => {
    if (err) {
      console.error('Database query error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    return res.status(200).json(result);
  });
});

app.post('/saveAttendance',authenticate, (req, res) => {
  const { lectureId, attendance } = req.body;

  console.log('Incoming request body:', req.body);

  try {
    // Validate input
    if (!lectureId || !Array.isArray(attendance)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    // Check if the lectureId exists in the lectures table
    db.query('SELECT * FROM lectures WHERE id = ?', [lectureId], (err, lectureResult) => {
      if (err) {
        console.error('Error fetching lecture:', err);
        return res.status(500).json({ error: 'Error checking lecture existence' });
      }

      if (lectureResult.length === 0) {
        return res.status(400).json({ error: `Lecture with ID ${lectureId} does not exist` });
      }

      // Proceed with attendance insertion if lecture exists
      const attendancePromises = attendance.map((record) => {
        const { studentId, isPresent } = record;

        if (studentId === 'undefined' || studentId == null) return;

        db.query('SELECT * FROM users WHERE id = ?', [studentId], (err, studentResult) => {
          if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ error: 'Error checking student existence' });
          }

          if (studentResult.length === 0) {
            console.log(`Skipping attendance for non-existent student with ID: ${studentId}`);
            return;
          }

          // Check if the student already has an attendance record for the lecture
          db.query('SELECT * FROM attendance WHERE studentId = ? AND lectureId = ?', [studentId, lectureId], (err, attendanceResult) => {
            if (err) {
              console.error('Error checking existing attendance record:', err);
              return res.status(500).json({ error: 'Error checking existing attendance' });
            }

            if (attendanceResult.length > 0) {
              // If attendance record exists, update it
              db.query('UPDATE attendance SET isPresent = ?, attendanceDate = ? WHERE studentId = ? AND lectureId = ?', 
              [isPresent, new Date().toISOString().split('T')[0], studentId, lectureId], 
              (err, updateResult) => {
                if (err) {
                  console.error('Error updating attendance record:', err);
                  return res.status(500).json({ error: 'Error updating attendance' });
                }
                console.log(`Updated attendance for student ID ${studentId}`);
              });
            } else {
              // If no attendance record, insert new one
              const today = new Date().toISOString().split('T')[0]; // Use today's date in 'YYYY-MM-DD' format
              db.query('INSERT INTO attendance (lectureId, studentId, isPresent, attendanceDate) VALUES (?, ?, ?, ?)', 
              [lectureId, studentId, isPresent, today], 
              (err, insertResult) => {
                if (err) {
                  console.error('Error inserting attendance record:', err);
                  return res.status(500).json({ error: 'Error saving attendance' });
                }
                console.log(`Inserted attendance for student ID ${studentId}`);
              });
            }
          });
        });
      });

      // Respond after processing all attendance records
      res.status(200).json({ message: 'Attendance saved successfully' });
    });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Error saving attendance records' });
  }
});

app.post('/createlecture', authenticate, async (req, res) => {
  const { classId, subjectId, date, lectureTitle, summary } = req.body;

  // Validate required fields
  if (!classId || !subjectId || !date || !lectureTitle || !summary) {
    return res.status(400).json({ error: 'classId, subjectId, date, lectureTitle, and summary are required' });
  }

  try {
    // Insert lecture into the lectures table
    const sql = 'INSERT INTO lectures (lectureTitle, summary, classId, subjectId, date) VALUES (?, ?, ?, ?, ?)';
    const result = await dbQuery(sql, [lectureTitle, summary, classId, subjectId, date]);

    const lectureId = result.insertId; // Get the newly inserted lecture's ID

    // Respond with success message
    return res.status(201).json({
      message: 'Lecture created successfully',
      lectureId: lectureId,
    });
  } catch (error) {
    console.error('Error creating lecture:', error);
    return res.status(500).json({ error: 'Could not create lecture' });
  }
});

app.post('/createsubjects',authenticate, async (req, res) => {
  const { subjectCode, subjectName, faculty_1, faculty_2, faculty_3, faculty_4,classid } = req.body;

  // Check if faculty fields are valid or null
  const validateFacultyIds = [faculty_1, faculty_2, faculty_3, faculty_4].every(facultyId => facultyId === '' || (!isNaN(facultyId) && facultyId));

  if (!validateFacultyIds) {
    return res.status(400).json({ error: 'Invalid faculty IDs provided' });
  }

  // Prepare the values for insertion, setting faculty values to NULL if empty
  const insertSubjectQuery = `
    INSERT INTO subject (subjectCode,classid, subjectName, faculty_1, faculty_2, faculty_3, faculty_4)
    VALUES (?, ?, ?, ?, ?, ?,?)
  `;

  const insertValues = [
    subjectCode,
    classid,
    subjectName,
    faculty_1 || null,  // Insert NULL if faculty_1 is empty
    faculty_2 || null,  // Insert NULL if faculty_2 is empty
    faculty_3 || null,  // Insert NULL if faculty_3 is empty
    faculty_4 || null,  // Insert NULL if faculty_4 is empty
  ];

  try {
    // Execute the insert query
    const result = await dbQuery(insertSubjectQuery, insertValues);

    // Return the newly created subject
    const newSubject = {
      id: result.insertId,
      classid,
      subjectCode,
      subjectName,
      faculty_1: faculty_1 || null,
      faculty_2: faculty_2 || null,
      faculty_3: faculty_3 || null,
      faculty_4: faculty_4 || null,
    };

    res.status(201).json(newSubject);
  } catch (error) {
    console.error('Error creating subject:', error); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/createClass', authenticate, (req, res) => {
  const { semester, department, program } = req.body;

  if (!semester || !department || !program) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const sql = 'INSERT INTO classes (semester, department, program) VALUES (?, ?, ?)';
  db.query(sql, [semester, department, program], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error: Could not create class' });
    }
    return res.status(201).json({ message: 'Class created successfully' });
  });
});


app.post('/addStudent', authenticate, (req, res) => {
  const { name, email, password, role, class_id } = req.body;

  if (!name || !email || !password || !role || !class_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if email already exists in the database
  const checkEmailSql = 'SELECT * FROM users WHERE email = ?';
  db.query(checkEmailSql, [email], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Proceed with insertion if email is unique
    const insertSql = 'INSERT INTO users (name, email, password, role, class_id) VALUES (?, ?, ?, ?, ?)';
    db.query(insertSql, [name, email, password, role, class_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error: Could not create student' });
      }
      return res.status(201).json({ message: 'Student added successfully' });
    });
  });
});

app.post('/deleteStudent', authenticate, (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ error: 'Student ID is required' });
  }

  // Check if the student exists in the database
  const checkStudentSql = 'SELECT * FROM users WHERE id = ?';
  db.query(checkStudentSql, [student_id], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Proceed with deletion
    const deleteSql = 'DELETE FROM users WHERE id = ?';
    db.query(deleteSql, [student_id], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error: Could not delete student' });
      }
      return res.status(200).json({ message: 'Student deleted successfully' });
    });
  });
});



const dbQuery = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};


const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {  
  console.log(`Server running on http://localhost:${PORT}`);
});