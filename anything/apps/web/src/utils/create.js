import sql from './sql';

const create = {
	db: () => ({
		from: (table) => {
			return {
				getById: async (id) => {
					try {
						const result = await sql`SELECT * FROM ${sql(table)} WHERE id = ${id} LIMIT 1`;
						return result.length > 0 ? result[0] : null;
					} catch (error) {
						console.error(`Database error in getById (${table}):`, error);
						throw error;
					}
				},
			};
		},
	}),
};

export default create;
