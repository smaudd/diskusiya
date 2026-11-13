// Create blocks record after user success creation
onRecordAfterCreateSuccess((e) => {
  const collection = $app.findCollectionByNameOrId("blocks");
  const record = new Record(collection);
  record.set("owner", e.record.id);
  $app.save(record);
  e.next();
}, "users");


onRecordDelete((e) => {
    const replyId = e.record.id;

    const records = $app.findRecordsByFilter(
        "replies",
        "replyingTo = {:replyId}",
        "",
        0,
        0,
        { replyId }
    );

    for (const record of records) {
        record.set("replyingToDeleted", true);
        $app.save(record);
    }

    e.next();
}, "replies");