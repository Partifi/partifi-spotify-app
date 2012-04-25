Storage.prototype.getObject = function(key) {
  return this.getItem(key) && JSON.parse(this.getItem(key));
};
Storage.prototype.setObject = function(key, value) {
  this.setItem(key, JSON.stringify(value));
};