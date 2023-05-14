package swim.server;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import org.testng.Assert;
import org.testng.annotations.Test;
import swim.actor.ActorSpaceDef;
import swim.api.SwimLane;
import swim.api.SwimRoute;
import swim.api.agent.AbstractAgent;
import swim.api.agent.AgentRoute;
import swim.api.lane.CommandLane;
import swim.api.plane.AbstractPlane;
import swim.concurrent.Cont;
import swim.kernel.Kernel;
import swim.service.web.WebServiceDef;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class CommandNewAgentSpec {

  private static final int NUMBER_OF_SENDING_AGENTS = 5;
  private static final int NUMBER_OF_UPDATES_PER_SENDER = 5;

  private static final CountDownLatch UPDATE_COUNTDOWN = new CountDownLatch(NUMBER_OF_SENDING_AGENTS * NUMBER_OF_UPDATES_PER_SENDER);
  private static final CountDownLatch CMD_ERROR_COUNTDOWN = new CountDownLatch(1);

  @Test
  public void testAgentStartupCommandBehaviour() throws InterruptedException {

    final Kernel kernel = ServerLoader.loadServerStack();
    final TestPlane plane = kernel.openSpace(ActorSpaceDef.fromName("test"))
        .openPlane("test", TestPlane.class);
    try {
      kernel.openService(WebServiceDef.standard().port(53556).spaceName("test"));
      kernel.start();

      for (int i = 0; i < NUMBER_OF_SENDING_AGENTS; i++) {
        plane.command("/sender/" + i, "start", Value.absent());
      }

      UPDATE_COUNTDOWN.await(2, TimeUnit.SECONDS);
      Assert.assertEquals(CMD_ERROR_COUNTDOWN.getCount(), 1);
      Assert.assertEquals(UPDATE_COUNTDOWN.getCount(), 0);

    } finally {
      kernel.stop();
    }
  }

  private static class TestPlane extends AbstractPlane {

    @SwimRoute("/receiver/:id")
    AgentRoute<ReceivingAgent> receivingAgentRoute;

    @SwimRoute("/sender/:id")
    AgentRoute<SendingAgent> sendingAgentRoute;

  }

  public static class ReceivingAgent extends AbstractAgent {

    @SwimLane("update")
    protected CommandLane<Value> update = this.<Value>commandLane()
        .onCommand(v -> {
          trace(nodeUri() + " : " + v.toString());
          UPDATE_COUNTDOWN.countDown();
        });

  }

  public static class SendingAgent extends AbstractAgent {

    @Override
    public void didStart() {
      for (int i = 0; i < NUMBER_OF_UPDATES_PER_SENDER; i++) {
        final Record msg = Record.create(2).slot("sender", Uri.form().mold(nodeUri()).toValue()).slot("index", i);
        command("/receiver/test", "update", msg, new Cont<CommandMessage>() {

          @Override
          public void bind(CommandMessage value) {
            // called when command is successfully sent
          }

          @Override
          public void trap(Throwable error) {
            CMD_ERROR_COUNTDOWN.countDown();
          }
        });
      }
    }

  }

}
