if (fs.existsSync(schemaPath)) {
  const schema = JSON.parse(fs.readFileSync(schemaPath));

  if (update.canonical_term && schema.properties?.canonical_term) {
    schema.properties.canonical_term.const = update.canonical_term;
  }

  if (update.classification && schema.properties?.classification) {
    schema.properties.classification.const = update.classification;
  }

  // limpiar errores viejos
  delete schema.canonical_term;
  delete schema.classification;

  fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
}
