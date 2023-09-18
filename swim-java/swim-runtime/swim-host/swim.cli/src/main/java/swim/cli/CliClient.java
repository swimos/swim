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

package swim.cli;

import swim.api.ref.WarpRef;
import swim.api.warp.WarpDownlink;
import swim.args.Arg;
import swim.args.Cmd;
import swim.args.Opt;
import swim.uri.Uri;

public class CliClient {

  protected final WarpRef warp;

  public CliClient(WarpRef warp) {
    this.warp = warp;
  }

  public final WarpRef warp() {
    return this.warp;
  }

  public String name() {
    return "swim-cli";
  }

  public Cmd mainCmd() {
    return Cmd.create(this.name())
              .cmd(this.linkCmd())
              .cmd(this.syncCmd())
              .cmd(this.getCmd())
              .cmd(this.reflectCmd())
              .helpCmd();
  }

  public Cmd linkCmd() {
    return Cmd.create("link")
              .desc("stream changes to a lane create a remote node")
              .opt(Opt.create("host").flag('h').arg("hostUri").desc("remote host to link"))
              .opt(Opt.create("node").flag('n').arg("nodeUri").desc("remote node to link"))
              .opt(Opt.create("lane").flag('l').arg("laneUri").desc("lane to link"))
              .opt(Opt.create("format").flag('f').arg("json|recon").desc("event output format"))
              .helpCmd()
              .exec(this::runLinkCmd);
  }

  public Cmd syncCmd() {
    return Cmd.create("sync")
              .desc("stream the current state and changes to a lane create a remote node")
              .opt(Opt.create("host").flag('h').arg("hostUri").desc("remote host to link"))
              .opt(Opt.create("node").flag('n').arg("nodeUri").desc("remote node to link"))
              .opt(Opt.create("lane").flag('l').arg("laneUri").desc("lane to link"))
              .opt(Opt.create("format").flag('f').arg("json|recon").desc("event output format"))
              .helpCmd()
              .exec(this::runSyncCmd);
  }

  public Cmd getCmd() {
    return Cmd.create("get")
              .desc("fetch the current state create a lane create a remote node")
              .opt(Opt.create("host").flag('h').arg("hostUri").desc("remote host to link"))
              .opt(Opt.create("node").flag('n').arg("nodeUri").desc("remote node to link"))
              .opt(Opt.create("lane").flag('l').arg("laneUri").desc("lane to link"))
              .opt(Opt.create("format").flag('f').arg("json|recon").desc("event output format"))
              .helpCmd()
              .exec(this::runGetCmd);
  }

  public Cmd reflectCmd() {
    return Cmd.create("reflect")
              .desc("stream introspection metadata")
              .opt(Opt.create("edge").flag('e').arg("edgeUri").desc("endpoint to introspect"))
              .opt(Opt.create("mesh").flag('m').arg(Arg.create("meshUri").optional(true)).desc("introspect default or specified mesh"))
              .opt(Opt.create("part").flag('p').arg(Arg.create("partKey").optional(true)).desc("introspect default or specified partition"))
              .opt(Opt.create("host").flag('h').arg(Arg.create("hostUri").optional(true)).desc("introspect default or specified host"))
              .opt(Opt.create("node").flag('n').arg("nodeUri").desc("introspect specified node"))
              .opt(Opt.create("lane").flag('l').arg("laneUri").desc("introspect specified lane"))
              .opt(Opt.create("link").flag('k').desc("introspect link behavior"))
              .opt(Opt.create("router").flag('r').desc("introspect router behavior"))
              .opt(Opt.create("data").desc("introspect data behavior"))
              .opt(Opt.create("system").desc("introspect system behavior"))
              .opt(Opt.create("process").desc("introspect process behavior"))
              .opt(Opt.create("stats").flag('s').desc("stream introspection statistics"))
              .opt(Opt.create("format").flag('f').arg("json|recon").desc("event output format"))
              .cmd(this.reflectLogCmd())
              .helpCmd()
              .exec(this::runReflectCmd);
  }

  public Cmd reflectLogCmd() {
    return Cmd.create("log")
              .desc("stream log events")
              .opt(Opt.create("trace").flag('t').desc("stream trace log messages"))
              .opt(Opt.create("debug").flag('d').desc("stream debug log messages"))
              .opt(Opt.create("info").flag('i').desc("stream info log messages"))
              .opt(Opt.create("warn").flag('w').desc("stream warning log messages"))
              .opt(Opt.create("error").flag('e').desc("stream error log messages"))
              .helpCmd()
              .exec(this::runReflectLogCmd);
  }

  public void runLinkCmd(Cmd cmd) {
    final WarpDownlink downlink = this.downlink(cmd).keepSynced(false);
    final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
    downlinkLogger.open();
  }

  public void runSyncCmd(Cmd cmd) {
    final WarpDownlink downlink = this.downlink(cmd).keepSynced(true);
    final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
    downlinkLogger.open();
  }

  public void runGetCmd(Cmd cmd) {
    final WarpDownlink downlink = this.downlink(cmd).keepSynced(true);
    final DownlinkGetter downlinkGetter = this.downlinkGetter(downlink, cmd);
    downlinkGetter.open();
  }

  public void runReflectCmd(Cmd cmd) {
    final String edgeUri = cmd.getOpt("edge").getValue();
    if (edgeUri != null) {
      final String meshUri = cmd.getOpt("mesh").getValue();
      final String hostUri = cmd.getOpt("host").getValue();
      final String nodeUri = cmd.getOpt("node").getValue();
      final String laneUri = cmd.getOpt("lane").getValue();
      if (nodeUri != null) {
        Uri metaNodeUri;
        if (meshUri != null) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri, "node", nodeUri);
        } else if (hostUri != null) {
          metaNodeUri = Uri.parse("swim:meta:host").appendedPath(hostUri, "node", nodeUri);
        } else {
          metaNodeUri = Uri.parse("swim:meta:node").appendedPath(nodeUri);
        }
        if (laneUri != null) {
          metaNodeUri = metaNodeUri.appendedPath("lane", laneUri);
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("linkStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          if (cmd.getOpt("link").isDefined()) {
            final WarpDownlink downlink = this.warp.downlink()
                                                   .hostUri(edgeUri)
                                                   .nodeUri(metaNodeUri)
                                                   .laneUri("linkStats")
                                                   .keepSynced(true);
            final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
            downlinkLogger.open();
          } else {
            final WarpDownlink downlink = this.warp.downlink()
                                                   .hostUri(edgeUri)
                                                   .nodeUri(metaNodeUri)
                                                   .laneUri("routerStats")
                                                   .keepSynced(true);
            final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
            downlinkLogger.open();
          }
        }
      } else if (hostUri != null) {
        Uri metaNodeUri;
        if (meshUri != null) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri);
          if (hostUri != null) {
            metaNodeUri = metaNodeUri.appendedPath("host", hostUri);
          }
        } else {
          metaNodeUri = Uri.parse("swim:meta:host");
          if (hostUri != null) {
            metaNodeUri = metaNodeUri.appendedPath(hostUri);
          }
        }
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("processStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("systemStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("dataStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("router").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("routerStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("linkStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("hostStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      } else if (meshUri != null) {
        Uri metaNodeUri = Uri.parse("swim:meta:mesh");
        if (meshUri != null) {
          metaNodeUri = metaNodeUri.appendedPath(meshUri);
        }
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("processStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("systemStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("dataStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("router").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("routerStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("linkStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri(metaNodeUri)
                                                 .laneUri("meshStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      } else {
        if (cmd.getOpt("process").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri("swim:meta:edge")
                                                 .laneUri("processStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("system").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri("swim:meta:edge")
                                                 .laneUri("systemStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("data").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri("swim:meta:edge")
                                                 .laneUri("dataStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else if (cmd.getOpt("link").isDefined()) {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri("swim:meta:edge")
                                                 .laneUri("linkStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        } else {
          final WarpDownlink downlink = this.warp.downlink()
                                                 .hostUri(edgeUri)
                                                 .nodeUri("swim:meta:edge")
                                                 .laneUri("routerStats")
                                                 .keepSynced(true);
          final DownlinkLogger downlinkLogger = this.downlinkLogger(downlink, cmd);
          downlinkLogger.open();
        }
      }
    }
  }

  public void runReflectLogCmd(Cmd cmd) {
    // TODO
  }

  protected WarpDownlink downlink(Cmd cmd) {
    return this.warp.downlink()
                    .hostUri(cmd.getOpt("host").getValue())
                    .nodeUri(cmd.getOpt("node").getValue())
                    .laneUri(cmd.getOpt("lane").getValue());
  }

  protected DownlinkLogger downlinkLogger(WarpDownlink downlink, Cmd cmd) {
    final String format = cmd.getOpt("format").getValue();
    return new DownlinkLogger(downlink, format);
  }

  protected DownlinkGetter downlinkGetter(WarpDownlink downlink, Cmd cmd) {
    final String format = cmd.getOpt("format").getValue();
    return new DownlinkGetter(downlink, format);
  }

}
