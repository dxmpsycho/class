exports.updateDbForce = async(knex) => {
    try {
        await knex.schema.withSchema('public').dropTableIfExists('lesson_teachers')
        await knex.schema.withSchema('public').dropTableIfExists('lesson_students')
        await knex.schema.withSchema('public').dropTableIfExists('lessons')
        await knex.schema.withSchema('public').dropTableIfExists('teachers')
        await knex.schema.withSchema('public').dropTableIfExists('students')

        await knex.schema.withSchema('public').createTable('lessons', function (table) {
            table.increments('id')
            table.date('date');
            table.string('title');
            table.integer('status');
            table.primary( [ 'id' ] );
        })
        await knex.schema.withSchema('public').createTable('teachers', function (table) {
            table.increments('id')
            table.string('name');
            table.primary( [ 'id' ] );
        })
        await knex.schema.withSchema('public').createTable('students', function (table) {
            table.increments('id')
            table.string('name');
            table.primary( [ 'id' ] );
        })
        await knex.schema.withSchema('public').createTable('lesson_teachers', function (table) {
            table.integer('lesson_id')
            table.integer('teacher_id')
            table.foreign('lesson_id').references( 'id' ).inTable( 'public.lessons' );
            table.foreign('teacher_id').references( 'id' ).inTable( 'public.teachers' );
        })
        await knex.schema.withSchema('public').createTable('lesson_students', function (table) {
            table.integer('lesson_id')
            table.integer('student_id')
            table.boolean('visit')
            table.foreign('lesson_id').references( 'id' ).inTable( 'public.lessons' );
            table.foreign('student_id').references( 'id' ).inTable( 'public.students' );
        })
        return 'created';
        console.log('created')
    } catch (err) {
        console.error(`Failed to create tables:`, err);
        if (knex) {
            await knex.destroy();
        }
    }
}