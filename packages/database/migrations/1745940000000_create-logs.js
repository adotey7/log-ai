exports.up = (pgm) => {
  pgm.createTable('logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    message: { type: 'text', notNull: true },
    stack: { type: 'text' },
    url: { type: 'text' },
    metadata: { type: 'jsonb', default: '{}' },
    explanation: { type: 'text' },
    causes: { type: 'jsonb', default: '[]' },
    fix: { type: 'text' },
    created_at: { type: 'timestamp', default: pgm.func('now()') },
  });

  pgm.createIndex('logs', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('logs');
};
