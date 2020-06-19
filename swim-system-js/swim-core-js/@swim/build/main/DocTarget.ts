// Copyright 2015-2020 Swim inc.
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

import * as fs from "fs";
import * as path from "path";
import * as typedoc from "typedoc";
import {Component, ConverterComponent} from "typedoc/dist/lib/converter/components";
import {Converter} from "typedoc/dist/lib/converter/converter";
import {Context} from "typedoc/dist/lib/converter/context";
import {Comment} from "typedoc/dist/lib/models/comments";

import {Target} from "./Target";

export interface TargetReflection {
  target: Target;
  reflection?: typedoc.Reflection;
}

@Component({name: "doc-target"})
export class DocTarget extends ConverterComponent {
  target: Target;
  fileTargetMap: {[fileName: string]: TargetReflection | undefined};

  initialize() {
    this.listenTo(this.owner, {
      [Converter.EVENT_CREATE_DECLARATION]: this.onDeclarationCreate,
      [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
    });
  }

  onDeclarationCreate(context: Context, reflection: typedoc.Reflection): void {
    const fileName = reflection.originalName;
    const fileInfo = this.fileTargetMap[fileName];
    if (fileInfo !== void 0) {
      fileInfo.reflection = reflection;
    }
  }

  onBeginResolve(context: Context): void {
    const reflections: typedoc.Reflection[] = [];
    for (const id in context.project.reflections) {
      const reflection = context.project.reflections[id];
      if (reflection.kind !== typedoc.ReflectionKind.Reference) {
        reflections.push(context.project.reflections[id]);
      } else {
        context.project.removeReflection(reflection);
      }
    }

    const targetReflections: {[uid: string]: TargetReflection | undefined} = {};

    const targets = this.target.transitiveTargets();
    for (let i = 0; i < targets.length; i += 1) {
      const target = targets[i];
      const indexPath = path.resolve(target.baseDir, "index.ts");
      const targetInfo = this.fileTargetMap[indexPath];
      if (targetInfo !== void 0) {
        delete this.fileTargetMap[indexPath];
        targetReflections[target.uid] = targetInfo;

        const targetReflection = targetInfo.reflection as typedoc.ContainerReflection;
        targetReflection.name = target.project.name;
        targetReflection.kind = typedoc.ReflectionKind.Namespace;

        const readmePath = path.join(target.project.baseDir, target.project.readme || "README.md");
        if (fs.existsSync(readmePath)) {
          const readme = fs.readFileSync(readmePath);
          targetReflection.comment = new Comment("", readme.toString());
        }
      }
    }

    const rootInfo = targetReflections[this.target.uid]!;
    const rootTarget = rootInfo.target;
    const rootReflection = rootInfo.reflection as typedoc.ContainerReflection;

    const rootReadmePath = path.join(this.target.project.baseDir, this.target.project.readme || "README.md");
    if (fs.existsSync(rootReadmePath)) {
      const readme = fs.readFileSync(rootReadmePath);
      rootReflection.comment = new Comment("", readme.toString());
    }

    for (const fileName in this.fileTargetMap) {
      // lift file reflections into library reflection
      const fileInfo = this.fileTargetMap[fileName]!;
      const targetInfo = targetReflections[fileInfo.target.uid]!;
      const fileReflection = fileInfo.reflection as typedoc.DeclarationReflection | undefined;
      const targetReflection = targetInfo.reflection as typedoc.ContainerReflection;
      if (targetReflection.children === void 0) {
        targetReflection.children = [];
      }

      const childReflections = reflections.filter((reflection) => reflection.parent === fileReflection);
      for (let i = 0; i < childReflections.length; i += 1) {
        const childReflection = childReflections[i] as typedoc.DeclarationReflection;
        childReflection.parent = targetReflection;
        targetReflection.children.push(childReflection);
      }
      if (fileReflection !== void 0) {
        if (fileReflection.children !== void 0) {
          fileReflection.children.length = 0;
        }
        context.project.removeReflection(fileReflection);
      }
    }

    if (rootTarget.project.umbrella) {
      for (let i = 0; i < targets.length; i += 1) {
        const target = targets[i];
        const targetReflection = targetReflections[target.uid]!.reflection as typedoc.ContainerReflection;
        if (targetReflection.children === void 0) {
          targetReflection.children = [];
        }
        if (targetReflection !== rootReflection && target.project.umbrella) {
          // add library reflections to parent framework reflection
          const targetDeps = target.deps;
          for (let j = 0; j < targetDeps.length; j += 1) {
            const targetDep = targetDeps[j];
            const depReflection = targetReflections[targetDep.uid]!.reflection as typedoc.DeclarationReflection;
            const oldParentReflection = depReflection.parent as typedoc.ContainerReflection | undefined;
            if (oldParentReflection !== void 0 && oldParentReflection.children !== void 0) {
              const index = oldParentReflection.children.indexOf(depReflection);
              if (index >= 0) {
                oldParentReflection.children.splice(index, 1);
              }
            }
            depReflection.parent = context.project; // keep library urls flat
            targetReflection.children.push(depReflection);
          }
        }
      }
      context.project.comment = rootReflection.comment;
      context.project.removeReflection(rootReflection);
    } else {
      // lift root library reflections into project reflection
      if (context.project.children === void 0) {
        context.project.children = [];
      }
      const childReflections = reflections.filter((reflection) => reflection.parent === rootReflection);
      for (let i = 0; i < childReflections.length; i += 1) {
        const childReflection = childReflections[i] as typedoc.DeclarationReflection;
        childReflection.parent = context.project;
        context.project.children.push(childReflection);
      }
      if (rootReflection.children !== void 0) {
        rootReflection.children.length = 0;
      }
      context.project.comment = rootReflection.comment;
      context.project.removeReflection(rootReflection);

      for (const targetName in targetReflections) {
        const targetInfo = targetReflections[targetName]!;
        context.project.removeReflection(targetInfo.reflection!);
      }
    }
  }
}
