class TestCommandAgent {
  constructor(context) {
    this.context = context;
    this.testLane = context.openLane("command", context.commandLane());

    this.testLane.onCommand(value => {
      console.log("lane onCommand value: " + value.stringValue())
    });
  }

  didStart() {
    console.log("TestCommandAgent.didStart");
  }
}

module.exports = TestCommandAgent;
