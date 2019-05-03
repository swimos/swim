package swim.runtime.uplink;

public enum ListOperation {
  UPDATE("update"),
  REMOVE("remove"),
  MOVE("move"),
  DROP("drop"),
  TAKE("take");

  final String tag;

  ListOperation(String tag) {
    this.tag = tag;
  }

  public boolean isUpdate() {
    return this == UPDATE;
  }

  public boolean isRemove() {
    return this == REMOVE;
  }

  public boolean isMove() {
    return this == MOVE;
  }

  public boolean isDrop() {
    return this == DROP;
  }

  public boolean isTake() {
    return this == TAKE;
  }

  public String tag() {
    return tag;
  }
}
