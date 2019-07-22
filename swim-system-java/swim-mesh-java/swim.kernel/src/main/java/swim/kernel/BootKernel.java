// Copyright 2015-2019 SWIM.AI inc.
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
import swim.runtime.EdgeBinding;
import swim.runtime.HostBinding;
import swim.runtime.HostDef;
import swim.runtime.LaneBinding;
import swim.runtime.LaneDef;
import swim.runtime.MeshBinding;
import swim.runtime.MeshDef;
import swim.runtime.PartBinding;
import swim.runtime.PartDef;
import swim.runtime.http.RestLaneModel;
import swim.runtime.lane.CommandLaneModel;
import swim.runtime.lane.ListLaneModel;
import swim.runtime.lane.MapLaneModel;
import swim.runtime.lane.SpatialLaneModel;
import swim.runtime.lane.SupplyLaneModel;
import swim.runtime.lane.ValueLaneModel;
import swim.runtime.router.EdgeTable;
import swim.runtime.router.HostTable;
import swim.runtime.router.MeshTable;
import swim.runtime.router.PartTable;
import swim.spatial.GeoProjection;
import swim.structure.Item;
import swim.structure.Value;
import swim.uri.Uri;

public class BootKernel extends KernelProxy implements IpStation {
  final double kernelPriority;
  final Value moduleConfig;
  KernelShutdownHook shutdownHook;
  volatile Stage stage;
  volatile Station station;

  public BootKernel(double kernelPriority, Value moduleConfig) {
    this.kernelPriority = kernelPriority;
    this.moduleConfig = moduleConfig;
  }

  public BootKernel(double kernelPriority) {
    this(kernelPriority, Value.absent());
  }

  public BootKernel() {
    this(KERNEL_PRIORITY, Value.absent());
  }

  @Override
  public final double kernelPriority() {
    return this.kernelPriority;
  }

  protected Stage createStage() {
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
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
    final KernelContext kernel = kernelWrapper().unwrapKernel(KernelContext.class);
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
        final Stage oldStage = this.stage;
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
            newStage = createStage();
            if (newStage instanceof MainStage) {
              ((MainStage) newStage).start();
            }
          }
          if (STAGE.compareAndSet(this, oldStage, newStage)) {
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
        final Station oldStation = this.station;
        if (oldStation != null) {
          station = oldStation;
          if (newStation != null) {
            // Lost creation race.
            newStation.stop();
            newStation = null;
          }
        } else {
          if (newStation == null) {
            newStation = createStation();
            newStation.start();
          }
          if (STATION.compareAndSet(this, oldStation, newStation)) {
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
      return createClock((ClockDef) scheduleDef, stage);
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
      return createTheater((TheaterDef) stageDef);
    } else {
      return super.createStage(stageDef);
    }
  }

  public Theater createTheater(TheaterDef theaterDef) {
    return new Theater(theaterDef);
  }

  @Override
  public Stage openStoreStage(String storeName) {
    Stage stage = super.openStoreStage(storeName);
    if (stage == null) {
      stage = stage();
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
  public EdgeBinding createEdge(String edgeName) {
    EdgeBinding edge = super.createEdge(edgeName);
    if (edge == null) {
      edge = new EdgeTable();
    }
    return edge;
  }

  @Override
  public Stage openEdgeStage(String edgeName) {
    Stage stage = super.openEdgeStage(edgeName);
    if (stage == null) {
      stage = stage();
      if (stage instanceof MainStage) {
        stage = new SideStage(stage); // isolate stage lifecycle
      }
    }
    return stage;
  }

  @Override
  public MeshBinding createMesh(String edgeName, MeshDef meshDef) {
    MeshBinding mesh = super.createMesh(edgeName, meshDef);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public MeshBinding createMesh(String edgeName, Uri meshUri) {
    MeshBinding mesh = super.createMesh(edgeName, meshUri);
    if (mesh == null) {
      mesh = new MeshTable();
    }
    return mesh;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, PartDef partDef) {
    PartBinding part = super.createPart(edgeName, meshUri, partDef);
    if (part == null) {
      part = new PartTable(partDef.predicate());
    }
    return part;
  }

  @Override
  public PartBinding createPart(String edgeName, Uri meshUri, Value partKey) {
    PartBinding part = super.createPart(edgeName, meshUri, partKey);
    if (part == null) {
      part = new PartTable();
    }
    return part;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, HostDef hostDef) {
    HostBinding host = super.createHost(edgeName, meshUri, partKey, hostDef);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  @Override
  public HostBinding createHost(String edgeName, Uri meshUri, Value partKey, Uri hostUri) {
    HostBinding host = super.createHost(edgeName, meshUri, partKey, hostUri);
    if (host == null) {
      host = new HostTable();
    }
    return host;
  }

  @Override
  public LaneBinding createLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    LaneBinding lane = super.createLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
    if (lane == null) {
      final String laneType = laneDef.laneType();
      if ("command".equals(laneType)) {
        lane = createCommandLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("list".equals(laneType)) {
        lane = createListLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("map".equals(laneType)) {
        lane = createMapLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("geospatial".equals(laneType)) {
        lane = createGeospatialLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("supply".equals(laneType)) {
        lane = createSupplyLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("value".equals(laneType)) {
        lane = createValueLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      } else if ("http".equals(laneType)) {
        lane = createHttpLane(edgeName, meshUri, partKey, hostUri, nodeUri, laneDef);
      }
    }
    return lane;
  }

  public LaneBinding createCommandLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new CommandLaneModel();
  }

  public LaneBinding createListLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new ListLaneModel();
  }

  public LaneBinding createMapLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new MapLaneModel();
  }

  public LaneBinding createGeospatialLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new SpatialLaneModel<R2Shape>(GeoProjection.wgs84Form());
  }

  public LaneBinding createSupplyLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new SupplyLaneModel();
  }

  public LaneBinding createValueLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new ValueLaneModel();
  }

  public LaneBinding createHttpLane(String edgeName, Uri meshUri, Value partKey, Uri hostUri, Uri nodeUri, LaneDef laneDef) {
    return new RestLaneModel();
  }

  @Override
  public void willStart() {
    this.shutdownHook = new KernelShutdownHook(kernelWrapper());
    Runtime.getRuntime().addShutdownHook(this.shutdownHook);
  }

  @Override
  public void didStop() {
    final Station station = STATION.getAndSet(this, null);
    if (station != null) {
      station.stop();
    }

    final Stage stage = STAGE.getAndSet(this, null);
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
    start();
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

  private static final double KERNEL_PRIORITY = Double.NEGATIVE_INFINITY;

  public static BootKernel fromValue(Value moduleConfig) {
    final Value header = moduleConfig.getAttr("kernel");
    final String kernelClassName = header.get("class").stringValue(null);
    if (kernelClassName == null || BootKernel.class.getName().equals(kernelClassName)) {
      final double kernelPriority = header.get("priority").doubleValue(KERNEL_PRIORITY);
      return new BootKernel(kernelPriority, moduleConfig);
    }
    return null;
  }

  static final AtomicReferenceFieldUpdater<BootKernel, Stage> STAGE =
      AtomicReferenceFieldUpdater.newUpdater(BootKernel.class, Stage.class, "stage");

  static final AtomicReferenceFieldUpdater<BootKernel, Station> STATION =
      AtomicReferenceFieldUpdater.newUpdater(BootKernel.class, Station.class, "station");
}
