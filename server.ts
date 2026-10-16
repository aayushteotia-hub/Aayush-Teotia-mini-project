import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';
import { optionalAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(optionalAuth);

  // -------------------------------------------------------------
  // Health & Stats
  // -------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.get('/api/stats', async (_req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [studentsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.students);
      const [teachersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.teachers);
      const [classesCount] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.classes);
      const [todayAttendance] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.attendance)
        .where(eq(schema.attendance.date, today));
      const [pendingComplaints] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.complaints)
        .where(eq(schema.complaints.status, 'Pending'));
      const [openVoting] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(schema.votingIssues)
        .where(eq(schema.votingIssues.status, 'Open'));

      res.json({
        totalStudents: studentsCount?.count || 0,
        totalTeachers: teachersCount?.count || 0,
        totalClasses: classesCount?.count || 0,
        todayAttendance: todayAttendance?.count || 0,
        pendingComplaints: pendingComplaints?.count || 0,
        openVoting: openVoting?.count || 0,
      });
    } catch (err: any) {
      console.error('Error in /api/stats:', err);
      res.status(500).json({ error: 'Failed to retrieve stats' });
    }
  });

  // -------------------------------------------------------------
  // Users & Auth Sync
  // -------------------------------------------------------------
  app.post('/api/users/sync', async (req: AuthRequest, res: Response) => {
    try {
      const { uid, name, email, role, avatar } = req.body;
      const userUid = uid || req.user?.uid || 'guest-user';
      const userEmail = email || req.user?.email || 'user@univ.edu';
      const userName = name || req.user?.name || 'University User';
      const userRole = role || 'student';

      const existing = await db.select().from(schema.users).where(eq(schema.users.uid, userUid)).limit(1);

      if (existing.length > 0) {
        const updated = await db
          .update(schema.users)
          .set({ name: userName, email: userEmail, role: userRole, avatar: avatar || existing[0].avatar })
          .where(eq(schema.users.uid, userUid))
          .returning();
        return res.json(updated[0]);
      }

      const inserted = await db
        .insert(schema.users)
        .values({
          uid: userUid,
          name: userName,
          email: userEmail,
          role: userRole,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName)}`,
        })
        .returning();

      res.json(inserted[0]);
    } catch (err: any) {
      console.error('Error syncing user:', err);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  });

  // -------------------------------------------------------------
  // Departments
  // -------------------------------------------------------------
  app.get('/api/departments', async (_req, res) => {
    try {
      const records = await db.select().from(schema.departments).orderBy(schema.departments.id);
      res.json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  app.post('/api/departments', async (req, res) => {
    try {
      const { name, code, head, description } = req.body;
      const inserted = await db.insert(schema.departments).values({ name, code, head, description }).returning();
      res.json(inserted[0]);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Failed to create department' });
    }
  });

  app.delete('/api/departments/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.departments).where(eq(schema.departments.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete department' });
    }
  });

  // -------------------------------------------------------------
  // Courses
  // -------------------------------------------------------------
  app.get('/api/courses', async (_req, res) => {
    try {
      const records = await db.select().from(schema.courses).orderBy(schema.courses.id);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  });

  app.post('/api/courses', async (req, res) => {
    try {
      const { departmentId, name, code, duration, totalSemesters } = req.body;
      const inserted = await db
        .insert(schema.courses)
        .values({
          departmentId: Number(departmentId) || 1,
          name,
          code,
          duration: duration || '4 Years',
          totalSemesters: Number(totalSemesters) || 8,
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create course' });
    }
  });

  app.delete('/api/courses/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.courses).where(eq(schema.courses.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete course' });
    }
  });

  // -------------------------------------------------------------
  // Classes
  // -------------------------------------------------------------
  app.get('/api/classes', async (_req, res) => {
    try {
      const records = await db.select().from(schema.classes).orderBy(schema.classes.id);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch classes' });
    }
  });

  app.post('/api/classes', async (req, res) => {
    try {
      const { courseId, name, semester, section, academicYear } = req.body;
      const inserted = await db
        .insert(schema.classes)
        .values({
          courseId: Number(courseId) || 1,
          name,
          semester: Number(semester) || 1,
          section: section || 'A',
          academicYear: academicYear || '2024-2025',
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create class' });
    }
  });

  app.delete('/api/classes/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.classes).where(eq(schema.classes.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete class' });
    }
  });

  // -------------------------------------------------------------
  // Teachers
  // -------------------------------------------------------------
  app.get('/api/teachers', async (_req, res) => {
    try {
      const records = await db.select().from(schema.teachers).orderBy(schema.teachers.id);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch teachers' });
    }
  });

  app.post('/api/teachers', async (req, res) => {
    try {
      const { employeeId, name, email, phone, department, designation, qualification, avatar } = req.body;
      const inserted = await db
        .insert(schema.teachers)
        .values({
          employeeId,
          name,
          email,
          phone,
          department,
          designation,
          qualification,
          avatar: avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create teacher' });
    }
  });

  app.put('/api/teachers/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, email, phone, department, designation, qualification } = req.body;
      const updated = await db
        .update(schema.teachers)
        .set({ name, email, phone, department, designation, qualification })
        .where(eq(schema.teachers.id, id))
        .returning();
      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update teacher' });
    }
  });

  app.delete('/api/teachers/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.teachers).where(eq(schema.teachers.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete teacher' });
    }
  });

  // -------------------------------------------------------------
  // Students
  // -------------------------------------------------------------
  app.get('/api/students', async (req, res) => {
    try {
      const { roll } = req.query;
      if (roll) {
        const student = await db.select().from(schema.students).where(eq(schema.students.rollNumber, String(roll))).limit(1);
        if (student.length === 0) {
          return res.status(404).json({ error: 'Student not found' });
        }
        return res.json(student[0]);
      }
      const records = await db.select().from(schema.students).orderBy(schema.students.rollNumber);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch students' });
    }
  });

  app.post('/api/students', async (req, res) => {
    try {
      const { rollNumber, name, email, phone, course, branch, semester, section, avatar, behaviourScore, behaviourRemarks, dob, address } = req.body;
      const inserted = await db
        .insert(schema.students)
        .values({
          rollNumber,
          name,
          email,
          phone,
          course: course || 'B.Tech',
          branch: branch || 'Computer Science & Engineering',
          semester: Number(semester) || 6,
          section: section || 'A',
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || rollNumber)}`,
          faceDescriptor: `face_${rollNumber.toLowerCase()}`,
          behaviourScore: behaviourScore || 'Good',
          behaviourRemarks: behaviourRemarks || 'Enthusiastic and engaged learner',
          dob: dob || '2004-01-01',
          address: address || 'Campus Residence',
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create student' });
    }
  });

  app.put('/api/students/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { name, email, phone, course, branch, semester, section, behaviourScore, behaviourRemarks, dob, address } = req.body;
      const updated = await db
        .update(schema.students)
        .set({
          name,
          email,
          phone,
          course,
          branch,
          semester: Number(semester),
          section,
          behaviourScore,
          behaviourRemarks,
          dob,
          address,
        })
        .where(eq(schema.students.id, id))
        .returning();
      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update student' });
    }
  });

  app.delete('/api/students/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.students).where(eq(schema.students.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete student' });
    }
  });

  // -------------------------------------------------------------
  // Subjects
  // -------------------------------------------------------------
  app.get('/api/subjects', async (_req, res) => {
    try {
      const records = await db.select().from(schema.subjects).orderBy(schema.subjects.id);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch subjects' });
    }
  });

  app.post('/api/subjects', async (req, res) => {
    try {
      const { code, name, course, semester, credits, teacherName } = req.body;
      const inserted = await db
        .insert(schema.subjects)
        .values({
          code,
          name,
          course: course || 'B.Tech',
          semester: Number(semester) || 6,
          credits: Number(credits) || 3,
          teacherName,
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create subject' });
    }
  });

  app.delete('/api/subjects/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.subjects).where(eq(schema.subjects.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete subject' });
    }
  });

  // -------------------------------------------------------------
  // Attendance (Main Highlight Feature)
  // -------------------------------------------------------------
  app.get('/api/attendance', async (req, res) => {
    try {
      const { studentRoll, date, subject } = req.query;
      let query = db.select().from(schema.attendance);

      const conditions = [];
      if (studentRoll) conditions.push(eq(schema.attendance.studentRoll, String(studentRoll)));
      if (date) conditions.push(eq(schema.attendance.date, String(date)));
      if (subject) conditions.push(eq(schema.attendance.subject, String(subject)));

      const records = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(schema.attendance.id))
        : await query.orderBy(desc(schema.attendance.id)).limit(100);

      res.json(records);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch attendance' });
    }
  });

  app.post('/api/attendance', async (req, res) => {
    try {
      const { studentId, studentRoll, studentName, date, time, subject, teacherName, status, method, remarks } = req.body;

      if (!studentRoll || !subject || !date) {
        return res.status(400).json({ error: 'Missing required attendance fields' });
      }

      // Prevent duplicate attendance for the same student on the same date and subject
      const existing = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.studentRoll, studentRoll),
            eq(schema.attendance.date, date),
            eq(schema.attendance.subject, subject)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({
          error: `Duplicate Attendance: ${studentName} (${studentRoll}) is already marked '${existing[0].status}' for ${subject} on ${date}.`,
          record: existing[0],
        });
      }

      const inserted = await db
        .insert(schema.attendance)
        .values({
          studentId: Number(studentId) || 1,
          studentRoll,
          studentName,
          date,
          time: time || new Date().toLocaleTimeString(),
          subject,
          teacherName: teacherName || 'Prof. Ananya Sen',
          status: status || 'Present',
          method: method || 'Face Recognition',
          remarks: remarks || '',
        })
        .returning();

      // Create a student notification
      try {
        await db.insert(schema.notifications).values({
          targetRole: 'student',
          targetRoll: studentRoll,
          title: `Attendance Marked: ${subject}`,
          message: `Your attendance for ${subject} on ${date} was marked as '${status || 'Present'}' via ${method || 'Face Recognition'}.`,
          type: 'attendance',
        });
      } catch (notifErr) {
        console.warn('Failed to insert notification:', notifErr);
      }

      res.status(201).json({
        message: 'Attendance Marked Successfully',
        record: inserted[0],
      });
    } catch (err: any) {
      console.error('Error marking attendance:', err);
      res.status(500).json({ error: err.message || 'Failed to mark attendance' });
    }
  });

  // -------------------------------------------------------------
  // Real-Time In-Lecture Teacher Verification Queue
  // -------------------------------------------------------------
  interface VerificationRequest {
    requestId: string;
    studentId: number;
    studentRoll: string;
    studentName: string;
    avatar?: string;
    subject: string;
    teacherName: string;
    room: string;
    lectureNumber: number;
    timestamp: string;
    date: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    matchConfidence: number;
  }

  const pendingAttendanceRequests: VerificationRequest[] = [];

  app.post('/api/attendance/scan', async (req, res) => {
    try {
      const { studentRoll, subject, teacherName, room, lectureNumber, matchConfidence } = req.body;
      const today = new Date().toISOString().split('T')[0];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Lookup student
      const studentQuery = await db
        .select()
        .from(schema.students)
        .where(eq(schema.students.rollNumber, String(studentRoll)))
        .limit(1);

      if (studentQuery.length === 0) {
        return res.status(404).json({ error: `Student with roll ${studentRoll} not found in university directory` });
      }

      const student = studentQuery[0];
      const targetSubject = subject || 'Database Management Systems';
      const targetTeacher = teacherName || 'Dr. Vikram Rathore';

      // Check if duplicate attendance already marked today for this subject
      const existing = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.studentRoll, student.rollNumber),
            eq(schema.attendance.date, today),
            eq(schema.attendance.subject, targetSubject)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return res.status(409).json({
          error: `Duplicate Attendance: ${student.name} (${student.rollNumber}) is already marked '${existing[0].status}' for ${targetSubject} on ${today}.`,
          record: existing[0],
        });
      }

      // Check if already pending approval
      const alreadyPending = pendingAttendanceRequests.find(
        (p) =>
          p.studentRoll === student.rollNumber &&
          p.subject === targetSubject &&
          p.date === today &&
          p.status === 'PENDING'
      );

      if (alreadyPending) {
        return res.json({
          status: 'QUEUED_FOR_APPROVAL',
          requestId: alreadyPending.requestId,
          message: `Verification request already awaiting approval from ${targetTeacher}.`,
          request: alreadyPending,
        });
      }

      const newRequest: VerificationRequest = {
        requestId: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: student.id,
        studentRoll: student.rollNumber,
        studentName: student.name,
        avatar: student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name)}`,
        subject: targetSubject,
        teacherName: targetTeacher,
        room: room || 'Room 301',
        lectureNumber: lectureNumber || 1,
        timestamp: nowTime,
        date: today,
        status: 'PENDING',
        matchConfidence: matchConfidence || 98.6,
      };

      pendingAttendanceRequests.unshift(newRequest);

      // Create a notification for the teacher
      try {
        await db.insert(schema.notifications).values({
          targetRole: 'teacher',
          title: `Attendance Verification: ${student.name}`,
          message: `${student.name} (${student.rollNumber}) scanned in for ${targetSubject} (${room || 'Room 301'}). Accept to mark attendance.`,
          type: 'attendance',
        });
      } catch (e) {
        console.warn(e);
      }

      res.json({
        status: 'QUEUED_FOR_APPROVAL',
        requestId: newRequest.requestId,
        message: `Face scanned successfully! Attendance request dispatched to ${targetTeacher} for in-lecture approval.`,
        request: newRequest,
      });
    } catch (err: any) {
      console.error('Error in /api/attendance/scan:', err);
      res.status(500).json({ error: err.message || 'Face scanning request failed' });
    }
  });

  app.get('/api/attendance/pending-requests', (req, res) => {
    const { teacherName } = req.query;
    if (teacherName) {
      const filtered = pendingAttendanceRequests.filter(
        (r) => r.teacherName.toLowerCase().includes(String(teacherName).toLowerCase()) || r.status === 'PENDING'
      );
      return res.json(filtered);
    }
    res.json(pendingAttendanceRequests);
  });

  app.get('/api/attendance/check-status/:requestId', (req, res) => {
    const { requestId } = req.params;
    const reqItem = pendingAttendanceRequests.find((r) => r.requestId === requestId);
    if (!reqItem) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(reqItem);
  });

  app.post('/api/attendance/verify', async (req, res) => {
    try {
      const { requestId, decision, status, remarks, teacherName } = req.body;
      const foundIdx = pendingAttendanceRequests.findIndex((r) => r.requestId === requestId);

      if (foundIdx === -1) {
        return res.status(404).json({ error: 'Verification request not found or expired' });
      }

      const item = pendingAttendanceRequests[foundIdx];

      if (decision === 'REJECTED') {
        item.status = 'REJECTED';
        await db.insert(schema.notifications).values({
          targetRole: 'student',
          targetRoll: item.studentRoll,
          title: `Attendance Verification Rejected: ${item.subject}`,
          message: `Your face scan attendance was not verified by the instructor.`,
          type: 'attendance',
        });
        return res.json({ success: true, status: 'REJECTED', message: 'Attendance verification rejected.' });
      }

      // Check if duplicate already exists
      const existing = await db
        .select()
        .from(schema.attendance)
        .where(
          and(
            eq(schema.attendance.studentRoll, item.studentRoll),
            eq(schema.attendance.date, item.date),
            eq(schema.attendance.subject, item.subject)
          )
        )
        .limit(1);

      let record;
      if (existing.length === 0) {
        const inserted = await db
          .insert(schema.attendance)
          .values({
            studentId: item.studentId,
            studentRoll: item.studentRoll,
            studentName: item.studentName,
            date: item.date,
            time: item.timestamp,
            subject: item.subject,
            teacherName: teacherName || item.teacherName,
            status: status || 'Present',
            method: 'Face Recognition',
            remarks: remarks || 'Verified by in-lecture instructor acceptance',
          })
          .returning();
        record = inserted[0];

        await db.insert(schema.notifications).values({
          targetRole: 'student',
          targetRoll: item.studentRoll,
          title: `Attendance Approved: ${item.subject}`,
          message: `Prof. ${teacherName || item.teacherName} approved your face scan. Marked 'Present'.`,
          type: 'attendance',
        });
      } else {
        record = existing[0];
      }

      item.status = 'APPROVED';

      res.json({
        success: true,
        status: 'APPROVED',
        message: 'Attendance Verified & Logged Successfully',
        record,
      });
    } catch (err: any) {
      console.error('Error in /api/attendance/verify:', err);
      res.status(500).json({ error: err.message || 'Failed to verify attendance' });
    }
  });

  // -------------------------------------------------------------
  // Marks & Grades
  // -------------------------------------------------------------
  app.get('/api/marks', async (req, res) => {
    try {
      const { studentRoll, semester } = req.query;
      let query = db.select().from(schema.marks);
      const conditions = [];
      if (studentRoll) conditions.push(eq(schema.marks.studentRoll, String(studentRoll)));
      if (semester) conditions.push(eq(schema.marks.semester, Number(semester)));

      const records = conditions.length > 0
        ? await query.where(and(...conditions)).orderBy(desc(schema.marks.id))
        : await query.orderBy(desc(schema.marks.id));

      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch marks' });
    }
  });

  app.post('/api/marks', async (req, res) => {
    try {
      const { studentId, studentRoll, studentName, subject, semester, examType, marksObtained, totalMarks, grade, date } = req.body;
      const inserted = await db
        .insert(schema.marks)
        .values({
          studentId: Number(studentId),
          studentRoll,
          studentName,
          subject,
          semester: Number(semester) || 6,
          examType: examType || 'Mid Term',
          marksObtained: Number(marksObtained),
          totalMarks: Number(totalMarks) || 100,
          grade: grade || 'A',
          date: date || new Date().toISOString().split('T')[0],
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to save marks' });
    }
  });

  // -------------------------------------------------------------
  // Timetable
  // -------------------------------------------------------------
  app.get('/api/timetable', async (req, res) => {
    try {
      const { day } = req.query;
      let query = db.select().from(schema.timetable);
      if (day) {
        const records = await query.where(eq(schema.timetable.dayOfWeek, String(day)));
        return res.json(records);
      }
      const records = await query.orderBy(schema.timetable.id);
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch timetable' });
    }
  });

  app.post('/api/timetable', async (req, res) => {
    try {
      const { dayOfWeek, timeSlot, subject, teacherName, room, course, semester, section } = req.body;
      const inserted = await db
        .insert(schema.timetable)
        .values({
          dayOfWeek,
          timeSlot,
          subject,
          teacherName,
          room,
          course: course || 'B.Tech',
          semester: Number(semester) || 6,
          section: section || 'A',
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to add timetable slot' });
    }
  });

  // -------------------------------------------------------------
  // Notices / Announcements
  // -------------------------------------------------------------
  app.get('/api/notices', async (_req, res) => {
    try {
      const records = await db.select().from(schema.notices).orderBy(desc(schema.notices.isPinned), desc(schema.notices.id));
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notices' });
    }
  });

  app.post('/api/notices', async (req, res) => {
    try {
      const { title, description, category, createdBy, creatorRole, isPinned } = req.body;
      const inserted = await db
        .insert(schema.notices)
        .values({
          title,
          description,
          category: category || 'University Announcement',
          date: new Date().toISOString().split('T')[0],
          createdBy: createdBy || 'Faculty Admin',
          creatorRole: creatorRole || 'admin',
          isPinned: Boolean(isPinned),
        })
        .returning();

      // Broadcast notification
      await db.insert(schema.notifications).values({
        targetRole: 'all',
        title: `Notice: ${title}`,
        message: description.slice(0, 100) + '...',
        type: 'notice',
      });

      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to post notice' });
    }
  });

  app.delete('/api/notices/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(schema.notices).where(eq(schema.notices.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete notice' });
    }
  });

  // -------------------------------------------------------------
  // Chat Groups & Messages
  // -------------------------------------------------------------
  app.get('/api/chat/groups', async (_req, res) => {
    try {
      const groups = await db.select().from(schema.chatGroups).orderBy(desc(schema.chatGroups.id));
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch chat groups' });
    }
  });

  app.post('/api/chat/groups', async (req, res) => {
    try {
      const { name, description, createdBy, createdRole } = req.body;
      const inserted = await db
        .insert(schema.chatGroups)
        .values({
          name,
          description: description || 'Study and project group',
          createdBy: createdBy || 'Student',
          createdRole: createdRole || 'student',
          membersCount: 2,
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create chat group' });
    }
  });

  app.get('/api/chat/messages', async (req, res) => {
    try {
      const groupId = Number(req.query.groupId);
      if (!groupId) return res.json([]);
      const messages = await db
        .select()
        .from(schema.chatMessages)
        .where(eq(schema.chatMessages.groupId, groupId))
        .orderBy(schema.chatMessages.id);
      res.json(messages);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch chat messages' });
    }
  });

  app.post('/api/chat/messages', async (req, res) => {
    try {
      const { groupId, senderName, senderRole, message } = req.body;
      const inserted = await db
        .insert(schema.chatMessages)
        .values({
          groupId: Number(groupId),
          senderName: senderName || 'User',
          senderRole: senderRole || 'student',
          message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        .returning();
      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to send message' });
    }
  });

  // -------------------------------------------------------------
  // Student Help Requests
  // -------------------------------------------------------------
  app.get('/api/help-requests', async (req, res) => {
    try {
      const { studentRoll } = req.query;
      let query = db.select().from(schema.helpRequests);
      if (studentRoll) {
        const records = await query.where(eq(schema.helpRequests.studentRoll, String(studentRoll))).orderBy(desc(schema.helpRequests.id));
        return res.json(records);
      }
      const records = await query.orderBy(desc(schema.helpRequests.id));
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch help requests' });
    }
  });

  app.post('/api/help-requests', async (req, res) => {
    try {
      const { studentName, studentRoll, teacherName, subject, problem } = req.body;
      const inserted = await db
        .insert(schema.helpRequests)
        .values({
          studentName,
          studentRoll,
          teacherName: teacherName || 'Prof. Ananya Sen',
          subject,
          problem,
          status: 'Pending',
        })
        .returning();

      // Notify teachers
      await db.insert(schema.notifications).values({
        targetRole: 'teacher',
        title: `New Help Request from ${studentName}`,
        message: `${studentName} (${studentRoll}) requested help in ${subject}: "${problem.slice(0, 60)}..."`,
        type: 'help',
      });

      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit help request' });
    }
  });

  app.patch('/api/help-requests/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, response, teacherName } = req.body;
      const updated = await db
        .update(schema.helpRequests)
        .set({
          status,
          response,
          teacherName,
          respondedAt: new Date().toLocaleString(),
        })
        .where(eq(schema.helpRequests.id, id))
        .returning();

      if (updated.length > 0) {
        await db.insert(schema.notifications).values({
          targetRole: 'student',
          targetRoll: updated[0].studentRoll,
          title: `Help Request Update: ${updated[0].subject}`,
          message: `${teacherName || 'Faculty'} responded: "${response?.slice(0, 70)}..." Status: ${status}`,
          type: 'help',
        });
      }

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update help request' });
    }
  });

  // -------------------------------------------------------------
  // Complaints
  // -------------------------------------------------------------
  app.get('/api/complaints', async (req, res) => {
    try {
      const { studentRoll } = req.query;
      let query = db.select().from(schema.complaints);
      if (studentRoll) {
        const records = await query.where(eq(schema.complaints.studentRoll, String(studentRoll))).orderBy(desc(schema.complaints.id));
        return res.json(records);
      }
      const records = await query.orderBy(desc(schema.complaints.id));
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch complaints' });
    }
  });

  app.post('/api/complaints', async (req, res) => {
    try {
      const { studentName, studentRoll, category, title, description } = req.body;
      const inserted = await db
        .insert(schema.complaints)
        .values({
          studentName,
          studentRoll,
          category: category || 'Academic',
          title,
          description,
          status: 'Pending',
        })
        .returning();

      // Notify admin
      await db.insert(schema.notifications).values({
        targetRole: 'admin',
        title: `New Grievance: [${category}] ${title}`,
        message: `Submitted by ${studentName} (${studentRoll})`,
        type: 'complaint',
      });

      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to submit complaint' });
    }
  });

  app.patch('/api/complaints/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { status, reviewedBy, resolutionNotes } = req.body;
      const updated = await db
        .update(schema.complaints)
        .set({
          status,
          reviewedBy,
          resolutionNotes,
        })
        .where(eq(schema.complaints.id, id))
        .returning();

      if (updated.length > 0) {
        await db.insert(schema.notifications).values({
          targetRole: 'student',
          targetRoll: updated[0].studentRoll,
          title: `Grievance Status: ${updated[0].title}`,
          message: `Status updated to '${status}'. Remarks: ${resolutionNotes || 'Reviewed by administration'}`,
          type: 'complaint',
        });
      }

      res.json(updated[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update complaint' });
    }
  });

  // -------------------------------------------------------------
  // Voting System
  // -------------------------------------------------------------
  app.get('/api/voting', async (req, res) => {
    try {
      const { studentRoll } = req.query;
      const issues = await db.select().from(schema.votingIssues).orderBy(desc(schema.votingIssues.id));
      const allVotes = await db.select().from(schema.votes);

      // Enhance with vote breakdown and user's vote
      const enriched = issues.map((issue) => {
        let parsedOptions: string[] = [];
        try {
          parsedOptions = JSON.parse(issue.options);
        } catch {
          parsedOptions = [issue.options];
        }

        const issueVotes = allVotes.filter((v) => v.issueId === issue.id);
        const optionsTally: Record<string, number> = {};
        parsedOptions.forEach((opt) => (optionsTally[opt] = 0));
        issueVotes.forEach((v) => {
          if (optionsTally[v.selectedOption] !== undefined) {
            optionsTally[v.selectedOption]++;
          } else {
            optionsTally[v.selectedOption] = 1;
          }
        });

        const userVote = studentRoll
          ? issueVotes.find((v) => v.studentRoll === String(studentRoll))
          : undefined;

        return {
          ...issue,
          parsedOptions,
          optionsTally,
          totalVotes: issueVotes.length,
          hasVoted: Boolean(userVote),
          userSelectedOption: userVote?.selectedOption,
        };
      });

      res.json(enriched);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch voting issues' });
    }
  });

  app.post('/api/voting', async (req, res) => {
    try {
      const { title, description, options, startDate, endDate } = req.body;
      const inserted = await db
        .insert(schema.votingIssues)
        .values({
          title,
          description,
          options: typeof options === 'string' ? options : JSON.stringify(options),
          startDate: startDate || new Date().toISOString().split('T')[0],
          endDate: endDate || '2025-04-30',
          status: 'Open',
        })
        .returning();

      await db.insert(schema.notifications).values({
        targetRole: 'all',
        title: `New Campus Vote: ${title}`,
        message: `A new student poll has been published. Cast your vote now!`,
        type: 'voting',
      });

      res.json(inserted[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create voting issue' });
    }
  });

  app.post('/api/voting/:id/vote', async (req, res) => {
    try {
      const issueId = Number(req.params.id);
      const { studentRoll, selectedOption } = req.body;

      if (!studentRoll || !selectedOption) {
        return res.status(400).json({ error: 'Roll number and selected option are required' });
      }

      // Check if student already voted
      const existingVote = await db
        .select()
        .from(schema.votes)
        .where(and(eq(schema.votes.issueId, issueId), eq(schema.votes.studentRoll, studentRoll)))
        .limit(1);

      if (existingVote.length > 0) {
        return res.status(400).json({ error: 'You have already voted on this campus issue.' });
      }

      await db.insert(schema.votes).values({
        issueId,
        studentRoll,
        selectedOption,
      });

      // Update total votes
      await db
        .update(schema.votingIssues)
        .set({ totalVotes: sql`${schema.votingIssues.totalVotes} + 1` })
        .where(eq(schema.votingIssues.id, issueId));

      res.json({ success: true, message: 'Vote recorded successfully!' });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Failed to cast vote' });
    }
  });

  // -------------------------------------------------------------
  // Notifications
  // -------------------------------------------------------------
  app.get('/api/notifications', async (req, res) => {
    try {
      const { role, roll } = req.query;
      const allNotifs = await db.select().from(schema.notifications).orderBy(desc(schema.notifications.id)).limit(40);

      // Filter relevant notifications
      const filtered = allNotifs.filter((n) => {
        if (!n.targetRole || n.targetRole === 'all') return true;
        if (role && n.targetRole === role) {
          if (!n.targetRoll) return true;
          if (roll && n.targetRoll === roll) return true;
        }
        return false;
      });

      res.json(filtered);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.update(schema.notifications).set({ isRead: true }).where(eq(schema.notifications.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update notification' });
    }
  });

  // -------------------------------------------------------------
  // Vite Integration (Dev) or Static Assets (Prod)
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`University Student Management System server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
