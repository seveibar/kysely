import { Kysely, sql } from '..'
import { Database } from '../shared'
import { expectError } from 'tsd'

function testWhere(db: Kysely<Database>) {
  // Column name
  db.selectFrom('person').where('first_name', '=', 'Arnold')

  // Table and column
  db.selectFrom('person').where('person.age', '=', 25)

  // Schema, table and column
  db.selectFrom('some_schema.movie').where('some_schema.movie.id', '=', '1')

  const nullableAge = 25 as number | null
  // Nullable RHS value
  db.selectFrom('person').where('age', 'in', nullableAge)

  // Nullable RHS reference
  db.selectFrom('person').whereRef('first_name', '=', 'last_name')

  // Nullable LHS with value
  db.selectFrom('person').where('last_name', '=', 'Jennifer')

  // Nullable LHS with reference
  db.selectFrom('person').whereRef('last_name', '=', 'first_name')

  // Subquery in LHS
  db.selectFrom('movie').where(
    (qb) => qb.selectFrom('person').select('gender'),
    '=',
    'female'
  )

  // Nullable subquery in LHS
  db.selectFrom('movie').where(
    (qb) => qb.selectFrom('person').select('last_name'),
    '=',
    'female'
  )

  // Subquery in RHS
  db.selectFrom('movie').where(sql`${'female'}`, '=', (qb) =>
    qb.selectFrom('person').select('gender')
  )

  // Nullable subquery in RHS
  db.selectFrom('person').where('first_name', 'in', (qb) =>
    qb.selectFrom('person').select('last_name')
  )

  // Raw expression
  db.selectFrom('person').where('first_name', '=', sql`'foo'`)
  db.selectFrom('person').where('first_name', '=', sql<string>`'foo'`)
  db.selectFrom('person').where(sql`whatever`, '=', 1)
  db.selectFrom('person').where(sql`whatever`, '=', true)
  db.selectFrom('person').where(sql`whatever`, '=', '1')

  // List value
  db.selectFrom('person').where('gender', 'in', ['female', 'male'])

  // Raw operator
  db.selectFrom('person').where('person.age', sql`lol`, 25)

  // Invalid operator
  expectError(db.selectFrom('person').where('person.age', 'lol', 25))

  // Invalid table
  expectError(db.selectFrom('person').where('movie.stars', '=', 25))

  // Invalid column
  expectError(db.selectFrom('person').where('stars', '=', 25))

  // Invalid type for column
  expectError(db.selectFrom('person').where('age', '=', '25'))

  // Invalid type for column
  expectError(db.selectFrom('person').where('gender', '=', 'not_a_gender'))

  // Invalid type for column
  expectError(
    db.selectFrom('person').where('gender', 'in', ['female', 'not_a_gender'])
  )

  // Invalid type for column
  expectError(
    db.selectFrom('some_schema.movie').where('some_schema.movie.id', '=', 1)
  )

  // Invalid type for column
  expectError(
    db
      .selectFrom('some_schema.movie')
      .where(
        (qb) => qb.selectFrom('person').select('gender'),
        '=',
        'not_a_gender'
      )
  )

  // Invalid type for column
  expectError(db.selectFrom('person').where('first_name', '=', sql<number>`1`))

  // Invalid type for column
  expectError(db.selectFrom('person').where(sql<string>`first_name`, '=', 1))
}
