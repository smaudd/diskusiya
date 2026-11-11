/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_827529408")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != null && (\n  @request.auth.blocks_via_owner.blocking ?!= user &&\n  @request.auth.blocks_via_blocking.owner ?!= user\n)"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_827529408")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != null && (\n  @request.auth.blocks_via_owner.blocking ?!= user &&\n  @request.auth.blocks_via_blocking.owner ?!= user &&\n  @request.auth.blocks_via_owner.blocking ?!= replyingTo.user\n)"
  }, collection)

  return app.save(collection)
})
