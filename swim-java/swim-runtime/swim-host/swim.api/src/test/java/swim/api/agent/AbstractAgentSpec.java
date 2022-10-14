package swim.api.agent;

import org.testng.Assert;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.lane.CommandLane;
import swim.api.plane.AbstractPlane;
import swim.kernel.Kernel;
import swim.server.ServerLoader;
import swim.service.web.WebServiceDef;
import swim.structure.Value;
import swim.uri.Uri;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

public class AbstractAgentSpec {

  private static final Uri TEST_AGENT_URI = Uri.parse("/test/agent");

  private static AgentLifecycleCallbackLatch agentLatch;
  private static AgentLifecycleCallbackLatch traitLatch;

  @Test
  public void testAgentLifecycleCallbacksOnClose() {
    runTestAgainstPlane(testPlane -> {

      givenTestAgent(testPlane);
      givenTestTraitAgent(testPlane);

      whenCloseCalled(testPlane);

      thenTestAgentClosed();
      thenTestTraitAgentClosed();
    });
  }

  private void thenTestAgentClosed() {
    Assert.assertTrue(agentLatch.wasCloseSuccessful());
  }

  private void thenTestTraitAgentClosed() {
    Assert.assertTrue(traitLatch.wasCloseSuccessful());
  }

  private void whenCloseCalled(final TestPlane plane) {
    // Call close on the agent
    plane.command(TEST_AGENT_URI, Uri.parse("startClose"), Value.absent());
  }

  private void givenTestAgent(final TestPlane plane) {

    // Create a latch for the agent to use
    agentLatch = new AgentLifecycleCallbackLatch();

    // Start the agent
    plane.command(TEST_AGENT_URI, Uri.parse("init"), Value.absent());

    // Ensure all hooks up to and including didStart were called
    Assert.assertTrue(agentLatch.wasStartSuccessful());
  }

  private void givenTestTraitAgent(final TestPlane plane) {
    // Create a latch for the agent to use
    traitLatch = new AgentLifecycleCallbackLatch();

    // Start the trait agent
    plane.command(TEST_AGENT_URI, Uri.parse("startTrait"), Value.absent());

    // Ensure all hooks up to and including didStart were called
    Assert.assertTrue(traitLatch.wasStartSuccessful());
  }

  private static class TestAgent extends LifecycleLatchedAgent {

    @SwimLane("startTrait")
    CommandLane<Value> startTrait = this.<Value>commandLane()
        .onCommand(v -> openAgent("trait", TestTraitAgent.class));

    @SwimLane("startClose")
    CommandLane<Value> startClose = this.<Value>commandLane()
        .onCommand(v -> close());

    @Override
    public void willOpen() {
      this.latch = agentLatch;
      super.willOpen();
    }

  }

  private static class TestTraitAgent extends LifecycleLatchedAgent {

    @Override
    public void willOpen() {
      this.latch = traitLatch;
      super.willOpen();
    }

  }

  private static class LifecycleLatchedAgent extends AbstractAgent {

    protected AgentLifecycleCallbackLatch latch;

    @Override
    public void willOpen() {
      super.willOpen();
      System.out.println(nodeUri() + ": willOpen");
      latch.willOpen();
    }

    @Override
    public void didOpen() {
      super.didOpen();
      System.out.println(nodeUri() + ": didOpen");
      latch.didOpen();
    }

    @Override
    public void willLoad() {
      super.willLoad();
      System.out.println(nodeUri() + ": willLoad");
      latch.willLoad();
    }

    @Override
    public void didLoad() {
      super.didLoad();
      System.out.println(nodeUri() + ": didLoad");
      latch.didLoad();
    }

    @Override
    public void willStart() {
      super.willStart();
      System.out.println(nodeUri() + ": willStart");
      latch.willStart();
    }

    @Override
    public void didStart() {
      super.didStart();
      System.out.println(nodeUri() + ": didStart");
      latch.didStart();
    }

    @Override
    public void willStop() {
      super.willStop();
      System.out.println(nodeUri() + ": willStop");
      latch.willStop();
    }

    @Override
    public void didStop() {
      super.didStop();
      System.out.println(nodeUri() + ": didStop");
      latch.didStop();
    }

    @Override
    public void willUnload() {
      super.willUnload();
      System.out.println(nodeUri() + ": willUnload");
      latch.willUnload();
    }

    @Override
    public void didUnload() {
      super.didUnload();
      System.out.println(nodeUri() + ": didUnload");
      latch.didUnload();
    }

    @Override
    public void willClose() {
      super.willClose();
      System.out.println(nodeUri() + ": willClose");
      latch.willClose();
    }

    @Override
    public void didClose() {
      super.didClose();
      System.out.println(nodeUri() + ": didClose");
      latch.didClose();
    }

  }

  private static class AgentLifecycleCallbackLatch {

    private CountDownLatch agentWillOpenCalled = new CountDownLatch(1);
    private CountDownLatch agentDidOpenCalled = new CountDownLatch(1);
    private CountDownLatch agentWillLoadCalled = new CountDownLatch(1);
    private CountDownLatch agentDidLoadCalled = new CountDownLatch(1);
    private CountDownLatch agentWillStartCalled = new CountDownLatch(1);
    private CountDownLatch agentDidStartCalled = new CountDownLatch(1);
    private CountDownLatch agentWillStopCalled = new CountDownLatch(1);
    private CountDownLatch agentDidStopCalled = new CountDownLatch(1);
    private CountDownLatch agentWillUnloadCalled = new CountDownLatch(1);
    private CountDownLatch agentDidUnloadCalled = new CountDownLatch(1);
    private CountDownLatch agentWillCloseCalled = new CountDownLatch(1);
    private CountDownLatch agentDidCloseCalled = new CountDownLatch(1);

    private boolean wasCloseSuccessful() {
      try {
        return agentDidCloseCalled.await(2, TimeUnit.SECONDS);
      } catch (InterruptedException interruptedException) {
        return false;
      }
    }

    private boolean wasStartSuccessful() {
      try {
        return agentDidStartCalled.await(2, TimeUnit.SECONDS);
      } catch (InterruptedException interruptedException) {
        return false;
      }
    }

    public void willOpen() {
      agentWillOpenCalled.countDown();
    }

    public void didOpen() {
      try {
        Assert.assertTrue(agentWillOpenCalled.await(2, TimeUnit.SECONDS));
        agentDidOpenCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void willLoad() {
      try {
        Assert.assertTrue(agentDidOpenCalled.await(2, TimeUnit.SECONDS));
        agentWillLoadCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void didLoad() {
      try {
        Assert.assertTrue(agentWillLoadCalled.await(2, TimeUnit.SECONDS));
        agentDidLoadCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void willStart() {
      try {
        Assert.assertTrue(agentDidLoadCalled.await(2, TimeUnit.SECONDS));
        agentWillStartCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void didStart() {
      try {
        Assert.assertTrue(agentWillStartCalled.await(2, TimeUnit.SECONDS));
        agentDidStartCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void willStop() {
      try {
        Assert.assertTrue(agentDidStartCalled.await(2, TimeUnit.SECONDS));
        agentWillStopCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void didStop() {
      try {
        Assert.assertTrue(agentWillStopCalled.await(2, TimeUnit.SECONDS));
        agentDidStopCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void willUnload() {
      try {
        Assert.assertTrue(agentDidStopCalled.await(2, TimeUnit.SECONDS));
        agentWillUnloadCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void didUnload() {
      try {
        Assert.assertTrue(agentWillUnloadCalled.await(2, TimeUnit.SECONDS));
        agentDidUnloadCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void willClose() {
      try {
        Assert.assertTrue(agentDidUnloadCalled.await(2, TimeUnit.SECONDS));
        agentWillCloseCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

    public void didClose() {
      try {
        Assert.assertTrue(agentWillCloseCalled.await(2, TimeUnit.SECONDS));
        agentDidCloseCalled.countDown();
      } catch (InterruptedException ie) {
        // Fail test
      }
    }

  }

  private static class TestPlane extends AbstractPlane {

    @SwimRoute("/test/:name")
    AgentRoute<TestAgent> testAgentRoute;

  }

  // Boilerplate plane creation
  private void runTestAgainstPlane(final Consumer<TestPlane> test) {
    final Kernel kernel = ServerLoader.loadServerStack();
    final TestPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestPlane.class);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();

      test.accept(plane);

    } finally {
      kernel.stop();
    }
  }
}
