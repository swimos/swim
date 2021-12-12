// Copyright 2015-2021 Swim.inc
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

import {Spec, Test, Exam} from "@swim/unit";
import {GeoJson, GeoShape, GeoPoint, GeoSegment, GeoSpline, GeoPath, GeoGroup} from "@swim/geo";

export class GeoJsonSpec extends Spec {
  @Test
  decodeGeoJsonPoints(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "Point", coordinates: [100.0, 0.0]}),
               GeoPoint.of(100.0, 0.0));
  }

  @Test
  decodeGeoJsonMultiPoints(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "MultiPoint", coordinates: [[100.0, 0.0], [101.0, 1.0]]}),
               GeoGroup.of(GeoPoint.of(100.0, 0.0), GeoPoint.of(101.0, 1.0)));
  }

  @Test
  decodeGeoJsonLineStrings(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "LineString", coordinates: [[100.0, 0.0], [101.0, 1.0]]}),
               GeoSpline.open(GeoSegment.of(100.0, 0.0, 101.0, 1.0)));
  }

  @Test
  decodeGeoJsonMultiLineStrings(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "MultiLineString", coordinates: [[[100.0, 0.0], [101.0, 1.0]], [[102.0, 2.0], [103.0, 3.0]]]}),
               GeoGroup.of(GeoSpline.open(GeoSegment.of(100.0, 0.0, 101.0, 1.0)),
                           GeoSpline.open(GeoSegment.of(102.0, 2.0, 103.0, 3.0))));
  }

  @Test
  decodeGeoJsonPolygons(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "Polygon", coordinates: [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]]}),
               GeoPath.closed(GeoSegment.of(100.0, 0.0, 101.0, 0.0), GeoSegment.of(101.0, 0.0, 101.0, 1.0), GeoSegment.of(101.0, 1.0, 100.0, 1.0), GeoSegment.of(100.0, 1.0, 100.0, 0.0)));
  }

  @Test
  decodeGeoJsonPolygonsWithHoles(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "Polygon", coordinates: [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                                                               [[100.8, 0.8], [100.8, 0.2], [100.2, 0.2], [100.2, 0.8], [100.8, 0.8]]]}),
               GeoPath.of(GeoSpline.closed(GeoSegment.of(100.0, 0.0, 101.0, 0.0), GeoSegment.of(101.0, 0.0, 101.0, 1.0), GeoSegment.of(101.0, 1.0, 100.0, 1.0), GeoSegment.of(100.0, 1.0, 100.0, 0.0)),
                          GeoSpline.closed(GeoSegment.of(100.8, 0.8, 100.8, 0.2), GeoSegment.of(100.8, 0.2, 100.2, 0.2), GeoSegment.of(100.2, 0.2, 100.2, 0.8), GeoSegment.of(100.2, 0.8, 100.8, 0.8))));
  }

  @Test
  decodeGeoJsonMultiPolygons(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "MultiPolygon", coordinates: [[[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],
                                                                    [[[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                                                                     [[100.8, 0.8], [100.8, 0.2], [100.2, 0.2], [100.2, 0.8], [100.8, 0.8]]]]}),
               GeoGroup.of(GeoPath.closed(GeoSegment.of(102.0, 2.0, 103.0, 2.0), GeoSegment.of(103.0, 2.0, 103.0, 3.0), GeoSegment.of(103.0, 3.0, 102.0, 3.0), GeoSegment.of(102.0, 3.0, 102.0, 2.0)),
                           GeoPath.of(GeoSpline.closed(GeoSegment.of(100.0, 0.0, 101.0, 0.0), GeoSegment.of(101.0, 0.0, 101.0, 1.0), GeoSegment.of(101.0, 1.0, 100.0, 1.0), GeoSegment.of(100.0, 1.0, 100.0, 0.0)),
                                      GeoSpline.closed(GeoSegment.of(100.8, 0.8, 100.8, 0.2), GeoSegment.of(100.8, 0.2, 100.2, 0.2), GeoSegment.of(100.2, 0.2, 100.2, 0.8), GeoSegment.of(100.2, 0.8, 100.8, 0.8)))));
  }

  @Test
  decodeGeoJsonGeometryCollections(exam: Exam): void {
    exam.equal(GeoJson.toShape({type: "GeometryCollection", geometries: [{type: "Point", coordinates: [100.0, 0.0]},
                                                                         {type: "LineString", coordinates: [[101.0, 0.0], [102.0, 1.0]]}]}),
               GeoGroup.of<GeoShape>(GeoPoint.of(100.0, 0.0),
                                     GeoSpline.open(GeoSegment.of(101.0, 0.0, 102.0, 1.0))));
  }
}
