class TestPlane {
  constructor(context) {
    this.context = context;
  }

  didStart() {
    console.log("TestPlane.didStart");
  }
}

module.exports = TestPlane;
