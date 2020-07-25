const logger = require('../logger').child(__filename);
const { Processor } = require('../models');

const getProcessor = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { processorId } = req.params;
    const processor = await Processor.findByProcessorId(processorId, userId);
    res.success(processor.serialize());
  } catch (err) {next(err);}
};

Object.assign(getProcessor, {
  description: 'Returns a single processor',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

const listProcessors = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const processors = await Processor.getProcessorList(userId);
    res.success(Processor.serialize(processors));
  } catch (err) {next(err);}
};

Object.assign(listProcessors, {
  description: 'Returns an array of the users processors',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'array',
});

const createProcessor = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const body = req.body;
    const processor = await Processor.createProcessor(userId, body);
    res.success(processor.serialize());
  } catch (err) {next(err);}
};

Object.assign(createProcessor, {
  description: 'Creates a new processor account for the user',
  required: {
    name: 'string',
    color: 'string',
    percentFee: 'integer',
  },
  optional: {
    test: 'boolean'
  },
  authenticated: true,
  returns: 'object',
});

const updateProcessor = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { processorId } = req.params;
    const body = req.body;
    const processor = await Processor.findByProcessorId(processorId, userId);
    const updated = await processor.updateProcessor(body);
    res.success(updated.serialize());
  } catch (err) {next(err);}
};

Object.assign(updateProcessor, {
  description: 'Updates an existing processor',
  required: {},
  optional: {
    name: 'string',
    color: 'string',
    percentFee: 'integer',
  },
  authenticated: true,
  returns: 'object',
});

const removeProcessor = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const { processorId } = req.params;
    const removed = await Processor.removeProcessor(processorId, userId);
    res.success({removed});
  } catch (err) {next(err);}
};

Object.assign(removeProcessor, {
  description: 'Removes a payment processor',
  required: {},
  optional: {},
  authenticated: true,
  returns: 'object',
});

module.exports = { getProcessor, listProcessors, createProcessor, updateProcessor, removeProcessor };