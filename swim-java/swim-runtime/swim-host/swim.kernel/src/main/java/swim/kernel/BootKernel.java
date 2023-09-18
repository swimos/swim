// Copyright 2015-2023 Nstream, inc.
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

package swim.kernel;

import java.net.InetSocketAddress;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.concurrent.Clock;
import swim.concurrent.ClockDef;
import swim.concurrent.MainStage;
import swim.concurrent.Schedule;
import swim.concurrent.ScheduleDef;
import swim.concurrent.SideStage;
import swim.concurrent.Stage;
import swim.concurrent.StageClock;
import swim.concurrent.StageDef;
import swim.concurrent.Theater;
import swim.concurrent.TheaterDef;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.io.IpStation;
import swim.io.Station;
import swim.io.TransportSettings;
import swim.math.R2Shape;
import swim.spatial.GeoProjection;
import swim.structure.Item;
import swim.structure.Value;
import swim.system.AuthenticatorAddress;
import swim.system.CellAddress;
import swim.system.EdgeAddress;
import swim.system.EdgeBinding;
import swim.system.HostAddress;
import swim.system.HostBinding;
import swim.system.HostDef;
import swim.system.LaneBinding;
import swim.system.LaneDef;
import swim.system.MeshAddress;
import swim.system.MeshBinding;
import swim.system.MeshDef;
import swim.system.NodeBinding;
import swim.system.PartAddress;
import swim.system.PartBinding;
import swim.system.PartDef;
import swim.system.StoreAddress;
import swim.system.http.RestLaneModel;
import swim.system.lane.CommandLaneModel;
import swim.system.lane.ListLaneModel;
import swim.system.lane.MapLaneModel;
import swim.system.lane.SpatialLaneModel;
import swim.system.lane.SupplyLaneModel;
import swim.system.lane.ValueLaneModel;
import swim.system.router.EdgeTable;
import swim.system.router.HostTable;
import swim.system.router.MeshTable;
import swim.system.router.PartTable;

public class BootKernel extends KernelProxy implements IpStation {

  final double kernelPriority;
  final Value moduleConfig;
  KernelShutdownHook shutdownHook;
  volatile Stage stage;
  volatile Station station;

  public BootKernel(double kernelPriority, Value moduleConfig) {
    this.kernelPriority = kernelPriority;
    this.moduleConfig = moduleConfig;
    this.shutdownHook = null;
    this.stage = null;
    this.station = null;
  }

  public BootKernel(double kernelPriority) {
    this(kernelPriority, Value.absent());
  }

  public BootKernel() {
    this(BootKernel.KERNEL_PRIORITY, Value.absent());
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  protected Stage createStage() {
    final KernelContext kernel = this.kernelWrapper().unwrapKernel(KernelContext.class);
    StageDef stageDef = null;
    for (Item item : this.moduleConfig) {
      final StageDef newStageDef = kernel.defineStage(item);
      if (newStageDef != null) {
        stageDef = newStageDef;
        continue;
      }
    }
    Stage stage = stageDef != null ? kernel.createStage(stageDef) : null;
    if (stage == null) {
      stage = new Theater("SwimKernel");
    }
    if (stage != null) {
      stage = kernel.injectStage(stage);
    }
    return stage;
  }

  protected Station createStation() {
    final KernelContext kernel = this.kernelWrapper().unwrapKernel(KernelContext.class);
    TransportSettings transportSettings = null;
    for (Item item : this.moduleConfig) {
      final TransportSettings newTransportSettings = TransportSettings.form().cast(item);
      if (newTransportSettings != null) {
        transportSettings = newTransportSettings;
        continue;
      }
    }
    Stage stage = kernel.stage();
    if (stage instanceof MainStage) {
      stage = new SideStage(stage); // isolate stage lifecycle
    }
    return new Station(stage, transportSettings);
  }

  @Override
  public final Stage stage() {
    Stage stage;
    Stage newStage = null;
    do {
      stage = super.stage();
      if (stage == null) {
        final Stage oldStage = BootKernel.STAGE.get(this);
        if (oldStage != null) {
          stage = oldStage;
          if (newStage != null) {
            // Lost creation race.
            if (newStage instanceof MainStage) {
              ((MainStage) newStage).stop();
            }
            newStage = null;
          }
        } else {
          if (newStage == null) {
            newStage = this.createStage();
            if (newStage instanceof MainStage) {
              ((MainStage) newStage).start();
            }
          }
          if (BootKernel.STAGE.compareAndSet(this, oldStage, newStage)) {
            stage = newStage;
          } else {
            continue;
          }
        }
      }
      break;
    } while (true);
    return stage;
  }

  @Override
  public final Station station() {
    Station station;
    Station newStation = null;
    do {
      station = super.station();
      if (station == null) {
        final Station oldStation = BootKernel.STATION.get(this);
        if (oldStation != null) {
          station = oldStation;
          if (newStation != null) {
            // Lost creation race.
            newStation.stop();
            newStation = null;
          }
        } else {
          if (newStation == null) {
            newStation = this.createStation();
            newStation.start();
          }
          if (BootKernel.STATION.compareAndSet(this, oldStation, newStation)) {
            station = newStation;
          } else {
            continue;
          }
        }
      }
      break;
    } while (true);
    return station;
  }

  @Override
  public ScheduleDef defineSchedule(Item scheduleConfig) {
    final ScheduleDef scheduleDef = ScheduleDef.form().cast(scheduleConfig);
    return scheduleDef != null ? scheduleDef : super.defineSchedule(scheduleConfig);
  }

  @Override
  public Schedule createSchedule(ScheduleDef scheduleDef, Stage stage) {
    if (scheduleDef instanceof ClockDef) {
      return this.createClock((ClockDef) scheduleDef, stage);
    } else {
      return super.createSchedule(scheduleDef, stage);
    }
  }

  public Clock createClock(ClockDef clockDef, Stage stage) {
    if (stage != null) {
      return new StageClock(stage, clockDef);
    } else {
      return new Clock(clockDef);
    }
  }

  @Override
  public StageDef defineStage(Item stageConfig) {
    final StageDef stageDef = StageDef.form().cast(stageConfig);
    return stageDef != null ? stageDef : super.defineStage(stageConfig);
  }

  @Override
  public Stage createStage(StageDef stageDef) {
    if (stageDef instanceof TheaterDef) {
      return this.createTheater((TheaterDef) stageDef);
    } else {
      return super.createStage(stageDef);
    }
  }

  public Theater createTheater(TheaterDef theaterDef) {
    return new Theater(theaterDef);
  }

  @Override
  public Stage createStage(CellAddress cellAddress) {
    Stage stage = super.createStage(cellAddress);
    if (stage == null && (cellAddress instanceof EdgeAddress
                       || cellAddress instanceof StoreAddress
                       || cellAddress instanceof AuthenticatorAddress)
    ) {
      // Provide default boot stage to edge and store cells.
      stage = this.stage();
      if (stage instanceof MainStage) {
        stage = new SideStage(stage); // isolate stage lifecycle
      }
    }
    return stage;
  }

  @Override
  public IpSettings ipSettings() {
    IpSettings ipSettings = super.ipSettings();
    if (ipSettings == null) {
      ipSettings = IpSettings.standard();
    }
    return ipSettings;
  }

  @Override
  public IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return IpStation.super.bindTcp(localAddress, service, ipSettings);
  }

  @Override
  public IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return IpStation.super.bindTls(localAddress, service, ipSettings);
  }

  @Override
  public IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return IpStation.super.connectTcp(remoteAddress, socket, ipSettings);
  }

  @Override
  public IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return IpStation.super.connectTls(remoteAddress, socket, ipSettings);
  }

  @Override
  public EdgeBinding createEdge(EdgeAddress edgeAddress) {
    EdgeBinding edge = super.createEdge(edgeAddress);
    if (edge == null) {
      edge = new EdgeTable();
    }
    return edge;
  }

  @Override
  public MeshBinding createMesh(EdgeBinding edge, MeshDef meshDef) {
    MeshBinding mesh = super.createMesh(edge, meshDef);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public MeshBinding createMesh(MeshAddress meshAddress) {
    MeshBinding mesh = super.createMesh(meshAddress);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public PartBinding createPart(MeshBinding mesh, PartDef partDef) {
    PartBinding part = super.createPart(mesh, partDef);
    if (part == null) {
      part = new PartTable(partDef.predicate());
    }
    return part;
  }

  @Override
  public PartBinding createPart(PartAddress partAddress) {
    PartBinding part = super.createPart(partAddress);
    if (part == null) {
      part = new PartTable();
    }
    return part;
  }

  @Override
  public HostBinding createHost(PartBinding part, HostDef hostDef) {
    HostBinding host = super.createHost(part, hostDef);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  @Override
  public HostBinding createHost(HostAddress hostAddress) {
    HostBinding host = super.createHost(hostAddress);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  @Override
  public LaneBinding createLane(NodeBinding node, LaneDef laneDef) {
    LaneBinding lane = super.createLane(node, laneDef);
    if (lane == null) {
      final String laneType = laneDef.laneType();
      if ("command".equals(laneType)) {
        lane = this.createCommandLane(node, laneDef);
      } else if ("list".equals(laneType)) {
        lane = this.createListLane(node, laneDef);
      } else if ("map".equals(laneType)) {
        lane = this.createMapLane(node, laneDef);
      } else if ("geospatial".equals(laneType)) {
        lane = this.createGeospatialLane(node, laneDef);
      } else if ("supply".equals(laneType)) {
        lane = this.createSupplyLane(node, laneDef);
      } else if ("value".equals(laneType)) {
        lane = this.createValueLane(node, laneDef);
      } else if ("http".equals(laneType)) {
        lane = this.createHttpLane(node, laneDef);
      }
    }
    return lane;
  }

  public LaneBinding createCommandLane(NodeBinding node, LaneDef laneDef) {
    return new CommandLaneModel();
  }

  public LaneBinding createListLane(NodeBinding node, LaneDef laneDef) {
    return new ListLaneModel();
  }

  public LaneBinding createMapLane(NodeBinding node, LaneDef laneDef) {
    return new MapLaneModel();
  }

  public LaneBinding createGeospatialLane(NodeBinding node, LaneDef laneDef) {
    return new SpatialLaneModel<R2Shape>(GeoProjection.wgs84Form());
  }

  public LaneBinding createSupplyLane(NodeBinding node, LaneDef laneDef) {
    return new SupplyLaneModel();
  }

  public LaneBinding createValueLane(NodeBinding node, LaneDef laneDef) {
    return new ValueLaneModel();
  }

  public LaneBinding createHttpLane(NodeBinding node, LaneDef laneDef) {
    return new RestLaneModel();
  }

  @Override
  public void willStart() {
    this.shutdownHook = new KernelShutdownHook(this.kernelWrapper());
    Runtime.getRuntime().addShutdownHook(this.shutdownHook);
  }

  @Override
  public void didStop() {
    final Station station = BootKernel.STATION.getAndSet(this, null);
    if (station != null) {
      station.stop();
    }

    final Stage stage = BootKernel.STAGE.getAndSet(this, null);
    if (stage instanceof MainStage) {
      ((MainStage) stage).stop();
    }

    final KernelShutdownHook shutdownHook = this.shutdownHook;
    if (Thread.currentThread() != shutdownHook) {
      Runtime.getRuntime().removeShutdownHook(shutdownHook);
    }
    this.shutdownHook = null;
  }

  @Override
  public void run() {
    this.start();
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.run();
    } else {
      final KernelShutdownHook shutdownHook = this.shutdownHook;
      if (shutdownHook != null) {
        while (shutdownHook.isAlive()) {
          try {
            shutdownHook.join();
          } catch (InterruptedException swallow) {
            // nop
          }
        }
      }
    }
  }

  @Override
  public void trace(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.trace(message);
    } else if (message != null) {
      System.out.println(message);
    }
  }

  @Override
  public void debug(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.debug(message);
    } else if (message != null) {
      System.out.println(message);
    }
  }

  @Override
  public void info(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.info(message);
    } else if (message != null) {
      System.out.println(message);
    }
  }

  @Override
  public void warn(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.warn(message);
    } else if (message != null) {
      System.out.println(message);
    }
  }

  @Override
  public void error(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.error(message);
    } else if (message != null) {
      System.err.println(message);
    }
  }

  @Override
  public void fail(Object message) {
    final KernelContext kernelContext = this.kernelContext;
    if (kernelContext != null) {
      kernelContext.fail(message);
    } else if (message instanceof Throwable) {
      ((Throwable) message).printStackTrace();
    } else if (message != null) {
      System.err.println(message);
    }
  }

  static final AtomicReferenceFieldUpdater<BootKernel, Stage> STAGE =
      AtomicReferenceFieldUpdater.newUpdater(BootKernel.class, Stage.class, "stage");
  static final AtomicReferenceFieldUpdater<BootKernel, Station> STATION =
      AtomicReferenceFieldUpdater.newUpdater(BootKernel.class, Station.class, "station");

  private static final double KERNEL_PRIORITY = Double.NEGATIVE_INFINITY;

  public static BootKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || BootKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(BootKernel.KERNEL_PRIORITY);
      return new BootKernel(kernelPriority, moduleConfig);
    }
    return null;
  }

}
