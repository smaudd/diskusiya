/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_827529408")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_827529408",
    "help": "",
    "hidden": false,
    "id": "relation3392192000",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "replyingTo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_827529408")

  // update field
  collection.fields.addAt(3, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_827529408",
    "help": "",
    "hidden": false,
    "id": "relation3392192000",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "replyingTo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
