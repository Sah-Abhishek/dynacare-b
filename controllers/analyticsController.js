const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = 'month' } = req.query;

    let dateFilter;
    const istNow = "CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'";
    const istToday = `(${istNow})::date`;

    switch (range) {
      case 'today':
        dateFilter = `appointment_date::date = ${istToday}`;
        break;
      case 'week':
        dateFilter = `appointment_date >= date_trunc('week', ${istNow})`;
        break;
      case 'month':
        dateFilter = `appointment_date >= date_trunc('month', ${istNow})`;
        break;
      case '3months':
        dateFilter = `appointment_date >= ${istNow} - interval '3 months'`;
        break;
      case 'year':
        dateFilter = `appointment_date >= date_trunc('year', ${istNow})`;
        break;
      default:
        dateFilter = `appointment_date >= date_trunc('month', ${istNow})`;
    }

    // Total Patients (Total is usually independent of range, but we can filter by created_at if needed, 
    // but user usually wants total. However, let's filter by range for 'New Patients' if that makes more sense.
    // For now, let's stick to Total Patients but maybe count NEW ones in the range?)
    const patientsCount = await db.query('SELECT COUNT(*) FROM patients');

    // Sessions in the range
    const sessionsQuery = `
            SELECT COUNT(*) FROM appointments 
            WHERE ${dateFilter}
        `;
    const sessionsResult = await db.query(sessionsQuery);

    // Active Treatments (Unique patients with appointments in the range)
    const activeTreatmentsQuery = `
            SELECT COUNT(DISTINCT patient_id) FROM appointments 
            WHERE ${dateFilter}
        `;
    const activeTreatmentsResult = await db.query(activeTreatmentsQuery);

    // Activity Trend (using the same range or last 7 days as default?)
    // Let's keep trend as last 7 days for the chart, it's more standard.
    const trend = await db.query(`
            SELECT 
                to_char(appointment_date AT TIME ZONE 'Asia/Kolkata', 'Mon DD') as day,
                COUNT(*) as count
            FROM appointments
            WHERE appointment_date >= CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata' - interval '7 days'
            GROUP BY 1
            ORDER BY MIN(appointment_date) ASC
        `, []);

    res.json({
      totalPatients: parseInt(patientsCount.rows[0].count),
      sessionsCount: parseInt(sessionsResult.rows[0].count),
      activeTreatments: parseInt(activeTreatmentsResult.rows[0].count),
      recoveryRate: 0,
      trend: trend.rows,
      range
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};
