const { neon } = require('@neondatabase/serverless');

let sqlInstance = null;
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set on this deployment. Add it in Vercel -> Project -> Settings -> Environment Variables, then redeploy.');
  }
  if (!sqlInstance) sqlInstance = neon(process.env.DATABASE_URL);
  return sqlInstance;
}

// Per-table config: primary key column, allowed columns for insert/update
// (whitelisted so column names can be safely concatenated into SQL text),
// jsonb columns (need JSON.stringify before sending as a parameter), and
// the fixed sort order used by the frontend.
const TABLES = {
  teams: {
    pk: 'id',
    columns: ['id', 'name', 'lead', 'capacity', 'load', 'dot'],
    jsonb: [],
    order: 'name ASC'
  },
  projects: {
    pk: 'id',
    columns: ['id', 'name', 'team_id', 'quarter', 'owner', 'progress', 'status', 'due', 'drift'],
    jsonb: [],
    order: 'id ASC'
  },
  key_results: {
    pk: 'id',
    columns: ['project_id', 'position', 'label', 'cur', 'target', 'unit', 'invert'],
    jsonb: [],
    order: 'position ASC'
  },
  tickets: {
    pk: 'id',
    columns: ['id', 'project_id', 'title', 'done'],
    jsonb: [],
    order: 'id ASC'
  },
  requests: {
    pk: 'id',
    columns: ['id', 'title', 'requester', 'team_id', 'priority', 'status', 'date', 'effort', 'note', 'extra'],
    jsonb: ['extra'],
    order: 'id DESC'
  },
  request_fields: {
    pk: 'key',
    columns: ['key', 'position', 'label', 'type', 'required', 'locked', 'options', 'placeholder', 'help'],
    jsonb: ['options'],
    order: 'position ASC'
  },
  referentiels: {
    pk: 'id',
    columns: ['referentiel', 'code', 'position', 'label', 'active'],
    jsonb: [],
    order: 'referentiel ASC, position ASC'
  }
};

function parseFilterValue(raw) {
  if (raw == null) return null;
  const m = /^eq\.(.*)$/.exec(String(raw));
  return m ? decodeURIComponent(m[1]) : null;
}

function parseBody(req) {
  if (req.body == null) return {};
  return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
}

function pickColumns(body, config) {
  const cols = [];
  const values = [];
  config.columns.forEach((col) => {
    if (Object.prototype.hasOwnProperty.call(body, col)) {
      cols.push(col);
      const v = body[col];
      values.push(config.jsonb.includes(col) ? JSON.stringify(v == null ? {} : v) : v);
    }
  });
  return { cols, values };
}

module.exports = async (req, res) => {
  const table = req.query.table;
  const config = TABLES[table];
  if (!config) {
    res.status(404).json({ message: 'Unknown table: ' + table });
    return;
  }

  try {
    const sql = getSql();

    if (req.method === 'GET') {
      if (table === 'projects') {
        const [projects, krs, tks] = await Promise.all([
          sql.query('SELECT * FROM projects ORDER BY id ASC'),
          sql.query('SELECT * FROM key_results ORDER BY position ASC'),
          sql.query('SELECT * FROM tickets ORDER BY id ASC')
        ]);
        const rows = projects.map((p) => Object.assign({}, p, {
          key_results: krs.filter((k) => k.project_id === p.id),
          tickets: tks.filter((t) => t.project_id === p.id)
        }));
        res.status(200).json(rows);
        return;
      }
      const rows = await sql.query('SELECT * FROM ' + table + ' ORDER BY ' + config.order);
      res.status(200).json(rows);
      return;
    }

    if (req.method === 'POST') {
      const body = parseBody(req);
      const { cols, values } = pickColumns(body, config);
      if (!cols.length) { res.status(400).json({ message: 'No valid columns in body' }); return; }
      const placeholders = cols.map((_, i) => '$' + (i + 1)).join(', ');
      const text = 'INSERT INTO ' + table + ' (' + cols.join(', ') + ') VALUES (' + placeholders + ')';
      await sql.query(text, values);
      res.status(201).json({});
      return;
    }

    if (req.method === 'PATCH') {
      const filterValue = parseFilterValue(req.query[config.pk]);
      if (filterValue == null) { res.status(400).json({ message: 'Missing filter on ' + config.pk }); return; }
      const body = parseBody(req);
      const { cols, values } = pickColumns(body, config);
      if (!cols.length) { res.status(400).json({ message: 'No valid columns in body' }); return; }
      const setSql = cols.map((c, i) => c + ' = $' + (i + 1)).join(', ');
      const text = 'UPDATE ' + table + ' SET ' + setSql + ' WHERE ' + config.pk + ' = $' + (cols.length + 1);
      await sql.query(text, values.concat([filterValue]));
      res.status(200).json({});
      return;
    }

    if (req.method === 'DELETE') {
      const filterValue = parseFilterValue(req.query[config.pk]);
      if (filterValue == null) { res.status(400).json({ message: 'Missing filter on ' + config.pk }); return; }
      await sql.query('DELETE FROM ' + table + ' WHERE ' + config.pk + ' = $1', [filterValue]);
      res.status(200).json({});
      return;
    }

    res.status(405).json({ message: 'Method not allowed' });
  } catch (e) {
    res.status(500).json({ message: String((e && e.message) || e) });
  }
};
