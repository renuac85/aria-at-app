const ModelService = require('./ModelService');
const {
    AT_ATTRIBUTES,
    AT_VERSION_ATTRIBUTES,
    AT_MODE_ATTRIBUTES
} = require('./helpers');
const { Sequelize, At, AtVersion, AtMode } = require('../');
const { Op } = Sequelize;

// association helpers to be included with Models' results

/**
 * @param atAttributes - At attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atAssociation = atAttributes => ({
    association: 'atObject',
    attributes: atAttributes
});

/**
 * @param atVersionAttributes - AtVersion attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atVersionAssociation = atVersionAttributes => ({
    association: 'versions',
    attributes: atVersionAttributes
});

/**
 * @param atModeAttributes - AtMode attributes
 * @returns {{association: string, attributes: string[]}}
 */
const atModeAssociation = atModeAttributes => ({
    association: 'modes',
    attributes: atModeAttributes
});

// At

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {number} id - unique id of the At model being queried
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getAtById = async (
    id,
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    return ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getAts = async (
    search,
    filter = {},
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        At,
        where,
        atAttributes,
        [
            atVersionAssociation(atVersionAttributes),
            atModeAssociation(atModeAttributes)
        ],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the At record
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createAt = async (
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    const atResult = await ModelService.create(At, { name });
    const { id } = atResult;

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

/**
 * @param {number} id - id of the At record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param id}
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateAt = async (
    id,
    { name },
    atAttributes = AT_ATTRIBUTES,
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atModeAttributes = AT_MODE_ATTRIBUTES
) => {
    await ModelService.update(At, { id }, { name });

    return await ModelService.getById(At, id, atAttributes, [
        atVersionAssociation(atVersionAttributes),
        atModeAssociation(atModeAttributes)
    ]);
};

/**
 * @param {number} id - id of the At record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAt = async (id, deleteOptions = { truncate: false }) => {
    return await ModelService.removeById(At, id, deleteOptions);
};

// AtVersion

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the AtVersion model being queried
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getAtVersionByQuery = async (
    { at, version },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    return ModelService.getByQuery(
        AtVersion,
        { at, version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getAtVersions = async (
    search,
    filter = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, version: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtVersion,
        where,
        atVersionAttributes,
        [atAssociation(atAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the AtVersion record
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createAtVersion = async (
    { at, version },
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.create(AtVersion, { at, version });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtVersion,
        { at, version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the AtVersion record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} atVersionAttributes  - AtVersion attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateAtVersionByQuery = async (
    { at, version },
    updateParams = {},
    atVersionAttributes = AT_VERSION_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.update(AtVersion, { at, version }, updateParams);

    return await ModelService.getByQuery(
        AtVersion,
        { at, version: updateParams.version || version },
        atVersionAttributes,
        [atAssociation(atAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the AtVersion record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtVersionByQuery = async (
    { at, version },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        AtVersion,
        { at, version },
        deleteOptions
    );
};

// AtMode

/**
 * You can pass any of the attribute arrays as '[]' to exclude that related association
 * @param {object} queryParams - unique values of the AtMode model being queried
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const getAtModeByQuery = async (
    { at, name },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    return ModelService.getByQuery(AtMode, { at, name }, atModeAttributes, [
        atAssociation(atAttributes)
    ]);
};

/**
 * @param {string|any} search - use this to combine with {@param filter} to be passed to Sequelize's where clause
 * @param {object} filter - use this define conditions to be passed to Sequelize's where clause
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @param {object} pagination - pagination options for query
 * @param {number} [pagination.page=0] - page to be queried in the pagination result (affected by {@param pagination.enablePagination})
 * @param {number} [pagination.limit=10] - amount of results to be returned per page (affected by {@param pagination.enablePagination})
 * @param {string[][]} [pagination.order=[]] - expects a Sequelize structured input dataset for sorting the Sequelize Model results (NOT affected by {@param pagination.enablePagination}). See {@link https://sequelize.org/v5/manual/querying.html#ordering} and {@example [ [ 'username', 'DESC' ], [..., ...], ... ]}
 * @param {boolean} [pagination.enablePagination=false] - use to enable pagination for a query result as well useful values. Data for all items matching query if not enabled
 * @returns {Promise<*>}
 */
const getAtModes = async (
    search,
    filter = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES,
    pagination = {}
) => {
    // search and filtering options
    let where = { ...filter };
    const searchQuery = search ? `%${search}%` : '';
    if (searchQuery) where = { ...where, name: { [Op.iLike]: searchQuery } };

    return await ModelService.get(
        AtMode,
        where,
        atModeAttributes,
        [atAssociation(atAttributes)],
        pagination
    );
};

/**
 * @param {object} createParams - values to be used to create the AtMode record
 * @param {string[]} atModeAttributes  - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes  - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const createAtMode = async (
    { at, name },
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.create(AtMode, { at, name });

    // to ensure the structure being returned matches what we expect for simple queries and can be controlled
    return await ModelService.getByQuery(
        AtMode,
        { at, name },
        atModeAttributes,
        [atAssociation(atAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the AtMode record to be updated
 * @param {object} updateParams - values to be used to update columns for the record being referenced for {@param queryParams}
 * @param {string[]} atModeAttributes - AtMode attributes to be returned in the result
 * @param {string[]} atAttributes - At attributes to be returned in the result
 * @returns {Promise<*>}
 */
const updateAtModeByQuery = async (
    { at, name },
    updateParams = {},
    atModeAttributes = AT_MODE_ATTRIBUTES,
    atAttributes = AT_ATTRIBUTES
) => {
    await ModelService.update(AtMode, { at, name }, updateParams);

    return await ModelService.getByQuery(
        AtMode,
        { at, name: updateParams.name || name },
        atModeAttributes,
        [atAssociation(atAttributes)]
    );
};

/**
 * @param {object} queryParams - values of the AtMode record to be removed
 * @param {object} deleteOptions - Sequelize specific deletion options that could be passed
 * @returns {Promise<boolean>}
 */
const removeAtModeByQuery = async (
    { at, name },
    deleteOptions = { truncate: false }
) => {
    return await ModelService.removeByQuery(
        AtMode,
        { at, name },
        deleteOptions
    );
};

module.exports = {
    // Basic CRUD [At]
    getAtById,
    getAts,
    createAt,
    updateAt,
    removeAt,

    // Basic CRUD [AtVersion]
    getAtVersionByQuery,
    getAtVersions,
    createAtVersion,
    updateAtVersionByQuery,
    removeAtVersionByQuery,

    // Basic CRUD [AtMode]
    getAtModeByQuery,
    getAtModes,
    createAtMode,
    updateAtModeByQuery,
    removeAtModeByQuery
};
