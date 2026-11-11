// Create blocks record after user success creation
onRecordAfterCreateSuccess((e) => {
  const collection = $app.findCollectionByNameOrId("blocks");
  const record = new Record(collection);
  record.set("owner", e.record.id);
  $app.save(record);
  e.next();
}, "users");