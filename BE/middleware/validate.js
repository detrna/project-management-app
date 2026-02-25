const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const errorMessage = error.details
        .map((d) => d.message.replace("/", ""))
        .join(", ");
      console.log(errorMessage);
      return res.status(400).json({ message: errorMessage });
    }
    req[source] = value;
    next();
  };
};

module.exports = { validate };
