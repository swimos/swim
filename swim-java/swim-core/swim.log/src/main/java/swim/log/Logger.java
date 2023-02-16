// Copyright 2015-2022 Swim.inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.log;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.lang.ref.SoftReference;
import java.util.Map;
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.HashTrieMap;
import swim.util.Notation;
import swim.util.Severity;
import swim.util.ToMarkup;
import swim.util.ToSource;

@Public
@Since("5.0")
public class Logger implements LogPublisher, ToMarkup, ToSource {

  final String topic;

  int flags;

  Severity level;

  Severity threshold;

  Severity effective;

  @Nullable Logger parent;

  HashTrieMap<String, SoftReference<Logger>> children;

  @Nullable String purgeKey;

  long purgeTime;

  @Nullable Object subscribers; // LogSubscriber | LogSubscriber[]

  protected Logger(String topic) {
    this.topic = topic;
    this.flags = BUBBLES_FLAG | INHERITS_FLAG;
    this.level = Severity.OFF;
    this.threshold = Severity.OFF;
    this.effective = Severity.OFF;
    this.parent = null;
    this.children = HashTrieMap.empty();
    this.purgeKey = null;
    this.purgeTime = 0L;
    this.subscribers = null;
  }

  void configure() {
    final String namespace = this.topic.length() != 0 ? this.topic + ".log" : "log";
    this.configureLevel(namespace);
    this.configureBubbles(namespace);
    this.configureInherits(namespace);
    this.configureHandlers(namespace);
    this.updateSeverity();
  }

  void configureLevel(String namespace) {
    final String level = System.getProperty(namespace + ".level");
    if (level != null) {
      try {
        this.level = Severity.parse(level);
      } catch (IllegalArgumentException e) {
        System.err.println("Unknown severity level: " + level);
      }
    }
  }

  void configureBubbles(String namespace) {
    final String bubbles = System.getProperty(namespace + ".bubbles");
    if (bubbles != null) {
      if ("true".equals(bubbles)) {
        this.flags |= BUBBLES_FLAG;
      } else if ("false".equals(bubbles)) {
        this.flags &= ~BUBBLES_FLAG;
      }
    }
  }

  void configureInherits(String namespace) {
    final String inherits = System.getProperty(namespace + ".inherits");
    if (inherits != null) {
      if ("true".equals(inherits)) {
        this.flags |= INHERITS_FLAG;
      } else if ("false".equals(inherits)) {
        this.flags &= ~INHERITS_FLAG;
      }
    }
  }

  void configureHandlers(String namespace) {
    final String handlers = System.getProperty(namespace + ".handlers");
    if (handlers != null) {
      final int length = handlers.length();
      int splitIndex = -1;
      int index = 0;
      do {
        final int c = index < length ? handlers.codePointAt(index) : -1;
        if (c == ',' || c == ' ' || c == -1) {
          this.configureHandler(handlers.substring(splitIndex + 1, index));
          splitIndex = index;
        }
        if (index < length) {
          index = handlers.offsetByCodePoints(index, 1);
        } else {
          break;
        }
      } while (true);
    }
  }

  void configureHandler(String handlerClassName) {
    if (handlerClassName.length() == 0) {
      return;
    }

    final Class<?> handlerClass;
    try {
      handlerClass = Class.forName(handlerClassName);
    } catch (ClassNotFoundException e) {
      System.err.println("Unknown log handler class " + handlerClassName);
      return;
    }

    if (handlerClass != null && !LogSubscriber.class.isAssignableFrom(handlerClass)) {
      System.err.println("Log handler class " + handlerClassName + " does not implement LogSubscriber");
      return;
    }

    final LogSubscriber handler;
    try {
      handler = (LogSubscriber) handlerClass.getDeclaredConstructor().newInstance();
    } catch (ReflectiveOperationException e) {
      System.err.println("Failed to instantiate log handler class " + handlerClassName);
      return;
    }

    this.subscribe(handler);
  }

  @Override
  public final String topic() {
    return this.topic;
  }

  public final boolean bubbles() {
    return ((int) FLAGS.getOpaque(this) & BUBBLES_FLAG) != 0;
  }

  public Logger bubbles(boolean bubbles) {
    int flags = (int) FLAGS.getOpaque(this);
    do {
      final int oldFlags = flags;
      final int newFlags;
      if (bubbles) {
        newFlags = oldFlags | BUBBLES_FLAG;
      } else {
        newFlags = oldFlags & ~BUBBLES_FLAG;
      }
      flags = (int) FLAGS.compareAndExchangeRelease(this, oldFlags, newFlags);
      if (flags == oldFlags) {
        if (oldFlags != newFlags) {
          this.updateSeverity();
        }
        break;
      }
    } while (true);
    return this;
  }

  public final boolean inherits() {
    return ((int) FLAGS.getOpaque(this) & INHERITS_FLAG) != 0;
  }

  public Logger inherits(boolean inherits) {
    int flags = (int) FLAGS.getOpaque(this);
    do {
      final int oldFlags = flags;
      final int newFlags;
      if (inherits) {
        newFlags = oldFlags | INHERITS_FLAG;
      } else {
        newFlags = oldFlags & ~INHERITS_FLAG;
      }
      flags = (int) FLAGS.compareAndExchangeRelease(this, oldFlags, newFlags);
      if (flags == oldFlags) {
        if (oldFlags != newFlags) {
          this.updateSeverity();
        }
        break;
      }
    } while (true);
    return this;
  }

  /**
   * Returns the minimum severity level of this logger.
   */
  public final Severity level() {
    return (Severity) LEVEL.getOpaque(this);
  }

  public synchronized Logger level(Severity level) {
    final Severity oldSeverity = (Severity) LEVEL.getAndSetRelease(this, level);
    if (!level.equals(oldSeverity)) {
      this.updateSeverity();
    }
    return this;
  }

  /**
   * Returns the severity threshold for bubbling log events to the parent logger.
   * Derived from the minimum of:
   * <ul>
   *   <li>the {@linkplain #level() severity level} of this logger;</li>
   *   <li>the {@linkplain #effective() effective severity} of any inherited parent logger.</li>
   * </ul>
   */
  public final Severity threshold() {
    return (Severity) THRESHOLD.getOpaque(this);
  }

  protected synchronized Logger threshold(Severity threshold) {
    THRESHOLD.setRelease(this, threshold);
    return this;
  }

  /**
   * Returns the effective severity level that this logger
   * {@linkplain #handles(Severity) handles}. Derived from the minimum of:
   * <ul>
   *   <li>the {@linkplain #level() severity level} of this logger;</li>
   *   <li>the minimum {@linkplain LogSubscriber#threshold() severity threshold} of all subscribers;</li>
   *   <li>the effective severity of any inherited parent logger.</li>
   * </ul>
   */
  public final Severity effective() {
    return (Severity) EFFECTIVE.getOpaque(this);
  }

  protected synchronized Logger effective(Severity effective) {
    final Severity oldEnabled = (Severity) EFFECTIVE.getAndSetRelease(this, effective);
    if (!effective.equals(oldEnabled)) {
      this.updateChildren();
    }
    return this;
  }

  public final @Nullable Logger parent() {
    return this.parent;
  }

  public Logger getChild(String subtopic) {
    Objects.requireNonNull(subtopic);
    final int length = subtopic.length();
    if (length == 0) {
      throw new IllegalArgumentException("Blank logger subtopic");
    }
    Logger logger = this;
    int dotIndex = -1;
    int index = 0;
    do {
      final int c = index < length ? subtopic.codePointAt(index) : -1;
      if (c == '.' || c == -1) {
        if (index == dotIndex + 1) {
          throw new IllegalArgumentException(new Notation().append("Empty identifier in logger subtopic: ")
                                                           .appendSource(subtopic)
                                                           .toString());
        }
        logger = logger.getDirectChild(subtopic.substring(dotIndex + 1, index));
        dotIndex = index;
      } else if (!Logger.isIdentifierChar(c)) {
        throw new IllegalArgumentException(new Notation().append("Invalid identifier character (")
                                                         .appendSourceCodePoint(c)
                                                         .append(") in logger subtopic: ")
                                                         .appendSource(subtopic)
                                                         .toString());
      }
      if (index < length) {
        index = subtopic.offsetByCodePoints(index, 1);
      } else {
        break;
      }
    } while (true);
    return logger;
  }

  @SuppressWarnings("ReferenceEquality")
  Logger getDirectChild(String segment) {
    // Get or create the child logger.
    HashTrieMap<String, SoftReference<Logger>> children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.getOpaque(this);
    Logger child = null;
    SoftReference<Logger> childRef = null;
    do {
      final SoftReference<Logger> oldChildRef = children.get(segment);
      final Logger oldChild = oldChildRef != null ? oldChildRef.get() : null;
      if (oldChild != null) {
        // Child logger already exists.
        child = oldChild;
        break;
      } else {
        if (child == null) {
          // Create the new child logger.
          final String childTopic;
          if (this.topic.length() != 0) {
            childTopic = this.topic + '.' + segment;
          } else {
            childTopic = segment;
          }
          child = this.createChild(childTopic);
          child.parent = this;
          child.configure();
          childRef = new SoftReference<Logger>(child);
        }
        // Try to add the new child logger to the children map.
        final HashTrieMap<String, SoftReference<Logger>> oldChildren = children;
        final HashTrieMap<String, SoftReference<Logger>> newChildren = oldChildren.updated(segment, childRef);
        children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          // Successfully inserted the new child logger.
          children = newChildren;
          break;
        }
      }
    } while (true);

    // Periodically help purge child logger references cleared by the GC.
    final long t = System.currentTimeMillis();
    if (t - (long) PURGE_TIME.getOpaque(this) >= PURGE_INTERVAL) {
      // Load the most recently checked child key.
      final String oldPurgeKey = (String) PURGE_KEY.getOpaque(this);
      // Get the next child key to check.
      final String newPurgeKey = children.nextKey(oldPurgeKey);
      // Check if the GC has cleared the child logger referenced by the purge key.
      final SoftReference<Logger> clearRef = children.get(newPurgeKey);
      if (clearRef == null || clearRef.get() != null
          || CHILDREN.weakCompareAndSetRelease(this, children, children.removed(newPurgeKey))) {
        // Try to update the purge key so that the next helper will pick up where we left off.
        if (PURGE_KEY.weakCompareAndSetPlain(this, oldPurgeKey, newPurgeKey)) {
          PURGE_TIME.setOpaque(this, t);
        }
      }
    }

    // Return the child logger.
    return child;
  }

  @SuppressWarnings("ReferenceEquality")
  void purgeDirectChild(String segment) {
    HashTrieMap<String, SoftReference<Logger>> children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.getOpaque(this);
    do {
      final SoftReference<Logger> childRef = children.get(segment);
      if (childRef == null || childRef.get() != null) {
        break;
      } else {
        final HashTrieMap<String, SoftReference<Logger>> oldChildren = children;
        final HashTrieMap<String, SoftReference<Logger>> newChildren = oldChildren.removed(segment);
        children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.compareAndExchangeRelease(this, oldChildren, newChildren);
        if (children == oldChildren) {
          children = newChildren;
          break;
        }
      }
    } while (true);
  }

  @Override
  public void subscribe(LogSubscriber subscriber) {
    Object subscribersRef = SUBSCRIBERS.getOpaque(this);
    outer: do {
      final Object oldSubscribersRef = subscribersRef;
      final Object newSubscribersRef;
      if (subscribersRef == null) {
        newSubscribersRef = subscriber;
      } else if (subscribersRef instanceof LogSubscriber) {
        final LogSubscriber oldSubscriber = (LogSubscriber) subscribersRef;
        if (subscriber == oldSubscriber) {
          break;
        }
        final LogSubscriber[] newSubscribers = new LogSubscriber[2];
        newSubscribers[0] = oldSubscriber;
        newSubscribers[1] = subscriber;
        newSubscribersRef = newSubscribers;
      } else if (subscribersRef instanceof LogSubscriber[]) {
        final LogSubscriber[] oldSubscribers = (LogSubscriber[]) subscribersRef;
        final int n = oldSubscribers.length;
        final LogSubscriber[] newSubscribers = new LogSubscriber[n + 1];
        for (int i = 0; i < n; i += 1) {
          final LogSubscriber oldSubscriber = oldSubscribers[i];
          if (subscriber == oldSubscriber) {
            break outer;
          }
          newSubscribers[i] = oldSubscriber;
        }
        newSubscribers[n] = subscriber;
        newSubscribersRef = newSubscribers;
      } else {
        throw new AssertionError(); // unreachable
      }
      subscribersRef = SUBSCRIBERS.compareAndExchangeRelease(this, oldSubscribersRef, newSubscribersRef);
      if (subscribersRef == oldSubscribersRef) {
        if (oldSubscribersRef != newSubscribersRef) {
          this.updateSeverity();
        }
        break;
      }
    } while (true);
  }

  @Override
  public void unsubscribe(LogSubscriber subscriber) {
    Object subscribersRef = SUBSCRIBERS.getOpaque(this);
    do {
      final Object oldSubscribersRef = subscribersRef;
      final Object newSubscribersRef;
      if (oldSubscribersRef == null) {
        break;
      } else if (oldSubscribersRef instanceof LogSubscriber) {
        final LogSubscriber oldSubscriber = (LogSubscriber) oldSubscribersRef;
        if (oldSubscriber != subscriber) {
          break;
        }
        newSubscribersRef = null;
      } else if (oldSubscribersRef instanceof LogSubscriber[]) {
        final LogSubscriber[] oldSubscribers = (LogSubscriber[]) oldSubscribersRef;
        final int n = oldSubscribers.length;
        int index = -1;
        for (int i = 0; i < n; i += 1) {
          if (oldSubscribers[i] == subscriber) {
            index = i;
            break;
          }
        }
        if (index < 0) {
          break;
        }
        if (n == 2) {
          if (index == 0) {
            newSubscribersRef = oldSubscribers[1];
          } else {
            newSubscribersRef = oldSubscribers[0];
          }
        } else {
          final LogSubscriber[] newSubscribers = new LogSubscriber[n - 1];
          System.arraycopy(oldSubscribers, 0, newSubscribers, 0, index);
          System.arraycopy(oldSubscribers, index + 1, newSubscribers, index, n - index - 1);
          newSubscribersRef = newSubscribers;
        }
      } else {
        throw new AssertionError(); // unreachable
      }
      subscribersRef = SUBSCRIBERS.compareAndExchangeRelease(this, oldSubscribersRef, newSubscribersRef);
      if (subscribersRef == oldSubscribersRef) {
        if (oldSubscribersRef != newSubscribersRef) {
          this.updateSeverity();
        }
        break;
      }
    } while (true);
  }

  @Override
  public void reconfigure(LogSubscriber subscriber) {
    this.updateSeverity();
  }

  protected synchronized void updateSeverity() {
    // Start with the minimum severity level of this logger.
    Severity severity = this.level();
    if (this.parent != null && this.inherits()) {
      // Include the threshold of the inherited parent logger.
      severity = severity.min(this.parent.effective());
    }
    this.threshold(severity);

    // Include the threshold of all subscribers.
    final Object subscribersRef = SUBSCRIBERS.getOpaque(this);
    if (subscribersRef instanceof LogSubscriber) {
      final LogSubscriber subscriber = (LogSubscriber) subscribersRef;
      severity = severity.min(subscriber.threshold());
    } else if (subscribersRef instanceof LogSubscriber[]) {
      final LogSubscriber[] subscribers = (LogSubscriber[]) subscribersRef;
      for (int i = 0; i < subscribers.length; i += 1) {
        final LogSubscriber subscriber = subscribers[i];
        severity = severity.min(subscriber.threshold());
      }
    }
    this.effective(severity);
  }

  protected synchronized void updateChildren() {
    final HashTrieMap<String, SoftReference<Logger>> children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.getOpaque(this);
    for (Map.Entry<String, SoftReference<Logger>> entry : children) {
      final Logger child = entry.getValue().get();
      if (child != null) {
        child.updateSeverity();
      } else {
        this.purgeDirectChild(entry.getKey());
      }
    }
  }

  @Override
  public final boolean handles(Severity level) {
    return this.effective().filter(level);
  }

  @Override
  public void publish(LogEvent event) {
    this.publishSubscribers(event);
    this.publishParent(event);
  }

  protected void publishSubscribers(LogEvent event) {
    final Object subscribersRef = SUBSCRIBERS.getOpaque(this);
    if (subscribersRef == null) {
      // nop
    } else if (subscribersRef instanceof LogSubscriber) {
      final LogSubscriber subscriber = (LogSubscriber) subscribersRef;
      if (subscriber.threshold().filter(event.level())) {
        subscriber.publish(event);
      }
    } else if (subscribersRef instanceof LogSubscriber[]) {
      final LogSubscriber[] subscribers = (LogSubscriber[]) subscribersRef;
      for (int i = 0; i < subscribers.length; i += 1) {
        final LogSubscriber subscriber = subscribers[i];
        if (subscriber.threshold().filter(event.level())) {
          subscriber.publish(event);
        }
      }
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  protected void publishParent(LogEvent event) {
    final Logger parent = this.parent;
    if (parent != null && this.bubbles()) {
      // Stop bubbling when local subscribers enabled the event;
      // this occurs when the inherited threshold does not allow
      // the event, but the local effective severity does allow it.
      final Severity level = event.level();
      if (this.threshold().filter(level) || !this.effective().filter(level)) {
        parent.publish(event);
      }
    } else if (parent == null && SUBSCRIBERS.getOpaque(this) == null) {
      // Print log events to console when root logger has no handlers.
      LogPrinter.console().publish(event);
    }
  }

  protected Logger createChild(String topic) {
    return new Logger(topic);
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("Logger")
            .appendField("topic", this.topic)
            .appendField("level", this.level())
            .appendField("threshold", this.threshold())
            .appendField("effective", this.effective())
            .appendField("bubbles", this.bubbles())
            .appendField("inherits", this.inherits());

    final Object subscribersRef = SUBSCRIBERS.getOpaque(this);
    if (notation.options().verbose() && subscribersRef != null) {
      notation.appendKey("subscribers")
              .beginValue()
              .beginArray();
      if (subscribersRef instanceof LogSubscriber) {
        notation.appendElement((LogSubscriber) subscribersRef);
      } else if (subscribersRef instanceof LogSubscriber[]) {
        final LogSubscriber[] subscribers = (LogSubscriber[]) subscribersRef;
        for (int i = 0; i < subscribers.length; i += 1) {
          notation.appendElement(subscribers[i]);
        }
      }
      notation.endArray()
              .endValue();
    }

    HashTrieMap<String, SoftReference<Logger>> children = (HashTrieMap<String, SoftReference<Logger>>) CHILDREN.getOpaque(this);
    if (notation.options().verbose() && !children.isEmpty()) {
      notation.appendKey("children")
              .beginValue()
              .beginObject();
      for (Map.Entry<String, SoftReference<Logger>> entry : children) {
        final Logger child = entry.getValue().get();
        if (child != null) {
          notation.appendField(entry.getKey(), child);
        }
      }
      notation.endObject()
              .endValue();
    }

    notation.endObject();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("Logger", "get")
            .appendArgument(this.topic)
            .endInvoke();
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  static final int BUBBLES_FLAG = 1 << 0;

  static final int INHERITS_FLAG = 1 << 1;

  static @Nullable Logger root;

  public static Logger root() {
    Logger root = (Logger) ROOT.getOpaque();
    if (root == null) {
      final Logger newRoot = new Logger("");
      newRoot.level = Severity.WARNING;
      newRoot.configure();
      root = (Logger) ROOT.compareAndExchangeRelease(null, newRoot);
      if (root == null) {
        root = newRoot;
      }
    }
    return root;
  }

  static final long PURGE_INTERVAL = 1000L;

  /**
   * {@code VarHandle} for atomically accessing the {@link #flags} field.
   */
  static final VarHandle FLAGS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #level} field.
   */
  static final VarHandle LEVEL;

  /**
   * {@code VarHandle} for atomically accessing the {@link #threshold} field.
   */
  static final VarHandle THRESHOLD;

  /**
   * {@code VarHandle} for atomically accessing the {@link #effective} field.
   */
  static final VarHandle EFFECTIVE;

  /**
   * {@code VarHandle} for atomically accessing the {@link #children} field.
   */
  static final VarHandle CHILDREN;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeKey} field.
   */
  static final VarHandle PURGE_KEY;

  /**
   * {@code VarHandle} for atomically accessing the {@link #purgeTime} field.
   */
  static final VarHandle PURGE_TIME;

  /**
   * {@code VarHandle} for atomically accessing the {@link #subscribers} field.
   */
  static final VarHandle SUBSCRIBERS;

  /**
   * {@code VarHandle} for atomically accessing the static {@link #root} field.
   */
  static final VarHandle ROOT;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      FLAGS = lookup.findVarHandle(Logger.class, "flags", Integer.TYPE);
      LEVEL = lookup.findVarHandle(Logger.class, "level", Severity.class);
      EFFECTIVE = lookup.findVarHandle(Logger.class, "effective", Severity.class);
      THRESHOLD = lookup.findVarHandle(Logger.class, "threshold", Severity.class);
      CHILDREN = lookup.findVarHandle(Logger.class, "children", HashTrieMap.class);
      PURGE_KEY = lookup.findVarHandle(Logger.class, "purgeKey", String.class);
      PURGE_TIME = lookup.findVarHandle(Logger.class, "purgeTime", Long.TYPE);
      SUBSCRIBERS = lookup.findVarHandle(Logger.class, "subscribers", Object.class);
      ROOT = lookup.findStaticVarHandle(Logger.class, "root", Logger.class);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

  static boolean isIdentifierChar(int c) {
    return (c >= '0' && c <= '9')
        || (c >= 'A' && c <= 'Z')
        || c == '_'
        || (c >= 'a' && c <= 'z')
        || c == 0xB7
        || (c >= 0xC0 && c <= 0xD6)
        || (c >= 0xD8 && c <= 0xF6)
        || (c >= 0xF8 && c <= 0x37D)
        || (c >= 0x37F && c <= 0x1FFF)
        || (c >= 0x200C && c <= 0x200D)
        || (c >= 0x203F && c <= 0x2040)
        || (c >= 0x2070 && c <= 0x218F)
        || (c >= 0x2C00 && c <= 0x2FEF)
        || (c >= 0x3001 && c <= 0xD7FF)
        || (c >= 0xF900 && c <= 0xFDCF)
        || (c >= 0xFDF0 && c <= 0xFFFD)
        || (c >= 0x10000 && c <= 0xEFFFF);
  }

}
