// Copyright 2015-2024 Nstream, inc.
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

import {Arg} from "@swim/args";
import {Opt} from "@swim/args";
import {Cmd} from "@swim/args";
import type {Value} from "@swim/structure";
import {Recon} from "@swim/recon";
import type {UriLike} from "@swim/uri";
import {Uri} from "@swim/uri";
import type {WarpDownlink} from "@swim/client";
import {WarpClient} from "@swim/client";

function link(hostUri: UriLike | undefined, nodeUri: UriLike | undefined,
              laneUri: UriLike | undefined, format?: string): WarpDownlink {
  return WarpClient.global().downlink({
    hostUri: hostUri,
    nodeUri: nodeUri,
    laneUri: laneUri,
    syncs: true,
    onEvent(body: Value): void {
      if (format === "json") {
        console.log(JSON.stringify(body.toLike()));
      } else {
        console.log(Recon.toString(body));
      }
    },
    didUnlink(): void {
      this.close();
    },
  });
}

const linkCmd = Cmd.create("link")
  .withHelpCmd()
  .withDesc("stream changes to a lane of a remote node")
  .withOpt(Opt.create("host").withFlag("h").withArg("hostUri").withDesc("remote host to link"))
  .withOpt(Opt.create("node").withFlag("n").withArg("nodeUri").withDesc("remote node to link"))
  .withOpt(Opt.create("lane").withFlag("l").withArg("laneUri").withDesc("lane to link"))
  .withOpt(Opt.create("format").withFlag("f").withArg("json|recon").withDesc("event output format"))
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    link(args.host, args.node, args.lane, args.format).sync(false).open();
  });

const syncCmd = Cmd.create("sync")
  .withHelpCmd()
  .withDesc("stream the current state and changes to a lane of a remote node")
  .withOpt(Opt.create("host").withFlag("h").withArg("hostUri").withDesc("remote host to link"))
  .withOpt(Opt.create("node").withFlag("n").withArg("nodeUri").withDesc("remote node to link"))
  .withOpt(Opt.create("lane").withFlag("l").withArg("laneUri").withDesc("lane to link"))
  .withOpt(Opt.create("format").withFlag("f").withArg("json|recon").withDesc("event output format"))
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    link(args.host, args.node, args.lane, args.format).open();
  });

const getCmd = Cmd.create("get")
  .withHelpCmd()
  .withDesc("fetch the current state of a lane of a remote node")
  .withOpt(Opt.create("host").withFlag("h").withArg("hostUri").withDesc("remote host to link"))
  .withOpt(Opt.create("node").withFlag("n").withArg("nodeUri").withDesc("remote node to link"))
  .withOpt(Opt.create("lane").withFlag("l").withArg("laneUri").withDesc("lane to link"))
  .withOpt(Opt.create("format").withFlag("f").withArg("json|recon").withDesc("event output format"))
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    WarpClient.global().downlink({
      hostUri: args.host,
      nodeUri: args.node,
      laneUri: args.lane,
      syncs: true,
      onEvent(body: Value): void {
        if (args.format === "json") {
          console.log(JSON.stringify(body.toLike()));
        } else {
          console.log(Recon.toString(body));
        }
      },
      didSync(): void {
        this.close();
      },
      didUnlink(): void {
        this.close();
      },
    }).open();
  });

const reflectLogCmd = Cmd.create("log")
  .withHelpCmd()
  .withDesc("stream log events")
  .withOpt(Opt.create("trace").withFlag("t").withDesc("stream trace log messages"))
  .withOpt(Opt.create("debug").withFlag("d").withDesc("stream debug log messages"))
  .withOpt(Opt.create("info").withFlag("i").withDesc("stream info log messages"))
  .withOpt(Opt.create("warn").withFlag("w").withDesc("stream warning log messages"))
  .withOpt(Opt.create("error").withFlag("e").withDesc("stream error log messages"))
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    // TODO
  });

const reflectCmd = Cmd.create("reflect")
  .withHelpCmd()
  .withDesc("stream introspection metadata")
  .withOpt(Opt.create("edge").withFlag("e").withArg("edgeUri").withDesc("endpoint to introspect"))
  .withOpt(Opt.create("mesh").withFlag("m").withArg(Arg.create("meshUri").asOptional(true)).withDesc("introspect default or specified mesh"))
  .withOpt(Opt.create("part").withFlag("p").withArg(Arg.create("partKey").asOptional(true)).withDesc("introspect default or specified partition"))
  .withOpt(Opt.create("host").withFlag("h").withArg(Arg.create("hostUri").asOptional(true)).withDesc("introspect default or specified host"))
  .withOpt(Opt.create("node").withFlag("n").withArg("nodeUri").withDesc("introspect specified node"))
  .withOpt(Opt.create("lane").withFlag("l").withArg("laneUri").withDesc("introspect specified lane"))
  .withOpt(Opt.create("link").withFlag("k").withDesc("introspect link behavior"))
  .withOpt(Opt.create("router").withFlag("r").withDesc("introspect router behavior"))
  .withOpt(Opt.create("data").withDesc("introspect data behavior"))
  .withOpt(Opt.create("system").withDesc("introspect system behavior"))
  .withOpt(Opt.create("process").withDesc("introspect process behavior"))
  .withOpt(Opt.create("stats").withFlag("s").withDesc("stream introspection statistics"))
  .withOpt(Opt.create("format").withFlag("f").withArg("json|recon").withDesc("event output format"))
  .withCmd(reflectLogCmd)
  .onExec(function (this: Cmd, args: {[name: string]: string | undefined}): void {
    const edgeUri = args.edge;
    if (edgeUri) {
      const meshUri = args.mesh;
      const hostUri = args.host;
      const nodeUri = args.node;
      const laneUri = args.lane;
      if (nodeUri) {
        let metaNodeUri: Uri;
        if (meshUri) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri, "node", nodeUri);
        } else if (hostUri) {
          metaNodeUri = Uri.parse("swim:meta:host").appendedPath(hostUri, "node", nodeUri);
        } else {
          metaNodeUri = Uri.parse("swim:meta:node").appendedPath(nodeUri);
        }
        if (laneUri) {
          metaNodeUri = metaNodeUri.appendedPath("lane", laneUri);
          link(edgeUri, metaNodeUri, "linkStats", args.format).open();
        } else {
          if ("link" in args) {
            link(edgeUri, metaNodeUri, "linkStats", args.format).open();
          } else {
            link(edgeUri, metaNodeUri, "routerStats", args.format).open();
          }
        }
      } else if (hostUri !== void 0) {
        let metaNodeUri: Uri;
        if (meshUri) {
          metaNodeUri = Uri.parse("swim:meta:mesh").appendedPath(meshUri);
          if (hostUri) {
            metaNodeUri = metaNodeUri.appendedPath("host", hostUri);
          }
        } else {
          metaNodeUri = Uri.parse("swim:meta:host");
          if (hostUri) {
            metaNodeUri = metaNodeUri.appendedPath(hostUri);
          }
        }
        if ("process" in args) {
          link(edgeUri, metaNodeUri, "processStats", args.format).open();
        } else if ("system" in args) {
          link(edgeUri, metaNodeUri, "systemStats", args.format).open();
        } else if ("data" in args) {
          link(edgeUri, metaNodeUri, "dataStats", args.format).open();
        } else if ("router" in args) {
          link(edgeUri, metaNodeUri, "routerStats", args.format).open();
        } else if ("link" in args) {
          link(edgeUri, metaNodeUri, "linkStats", args.format).open();
        } else {
          link(edgeUri, metaNodeUri, "hostStats", args.format).open();
        }
      } else if (meshUri !== void 0) {
        let metaNodeUri = Uri.parse("swim:meta:mesh");
        if (meshUri) {
          metaNodeUri = metaNodeUri.appendedPath(meshUri);
        }
        if ("process" in args) {
          link(edgeUri, metaNodeUri, "processStats", args.format).open();
        } else if ("system" in args) {
          link(edgeUri, metaNodeUri, "systemStats", args.format).open();
        } else if ("data" in args) {
          link(edgeUri, metaNodeUri, "dataStats", args.format).open();
        } else if ("router" in args) {
          link(edgeUri, metaNodeUri, "routerStats", args.format).open();
        } else if ("link" in args) {
          link(edgeUri, metaNodeUri, "linkStats", args.format).open();
        } else {
          link(edgeUri, metaNodeUri, "meshStats", args.format).open();
        }
      } else {
        if ("process" in args) {
          link(edgeUri, "swim:meta:edge", "processStats", args.format).open();
        } else if ("system" in args) {
          link(edgeUri, "swim:meta:edge", "systemStats", args.format).open();
        } else if ("data" in args) {
          link(edgeUri, "swim:meta:edge", "dataStats", args.format).open();
        } else if ("link" in args) {
          link(edgeUri, "swim:meta:edge", "linkStats", args.format).open();
        } else {
          link(edgeUri, "swim:meta:edge", "routerStats", args.format).open();
        }
      }
    }
  });

export const cli = Cmd.create("swim-client")
  .withCmd(linkCmd)
  .withCmd(syncCmd)
  .withCmd(getCmd)
  .withCmd(reflectCmd)
  .withHelpCmd();
