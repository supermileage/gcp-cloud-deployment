# Defined here: https://github.com/GoogleCloudPlatform/deploymentmanager-samples/tree/master/google/resource-snippets/cloudfunctions-v1
# resources:
# - type: gcp-types/cloudfunctions-v1:projects.locations.functions
#   name: {{ env['deployment'] }}-particle-bridge
#   properties:
#     parent: projects/{{ env['project'] }}/locations/{{ properties['region'] }}
#     function: {{ env['deployment'] }}-particle-bridge
#     sourceArchiveUrl: gs://{{ env['deployment']}}-particle-bridge/function.zip
#     entryPoint: {{ properties['entryPoint'] }}
#     runtime: {{ properties['runtime'] }}
#     eventTrigger:
#       resource: {{ properties['pubsubTopic'] }}
#       eventType: providers/cloud.pubsub/eventTypes/topic.publish

# Copyright 2017 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Cloud Function (nicely deployed in deployment) DM template."""

import base64
import hashlib
from io import BytesIO
import zipfile


def GenerateConfig(ctx):
  """Generate YAML resource configuration."""
  in_memory_output_file = BytesIO()
  function_name = ctx.env['deployment'] + 'cf'
  zip_file = zipfile.ZipFile(
      in_memory_output_file, mode='w', compression=zipfile.ZIP_DEFLATED)
  for imp in ctx.imports:
    if imp.startswith(ctx.properties['codeLocation']):
      zip_file.writestr(imp[len(ctx.properties['codeLocation']):],
                        ctx.imports[imp])
  zip_file.close()
  content = base64.b64encode(in_memory_output_file.getvalue())
  m = hashlib.md5()
  m.update(content)
  bucket = ctx.properties['codeBucket']
  source_archive_url = 'gs://%s/%s' % (bucket,
                                       m.hexdigest() + '.zip')
  cmd = "echo '%s' | base64 -d > /function/function.zip;" % (content.decode("utf-8"))
  volumes = [{'name': 'function-code', 'path': '/function'}]
  build_step = {
      'name': 'upload-function-code',
      'action': 'gcp-types/cloudbuild-v1:cloudbuild.projects.builds.create',
      'metadata': {
          'runtimePolicy': ['UPDATE_ON_CHANGE']
      },
      'properties': {
          'steps': [{
              'name': 'ubuntu',
              'args': ['bash', '-c', cmd],
              'volumes': volumes,
          }, {
              'name': 'gcr.io/cloud-builders/gsutil',
              'args': ['cp', '/function/function.zip', source_archive_url],
              'volumes': volumes
          }],
          'timeout':
              '120s'
      }
  }
  cloud_function = {
      'type': 'gcp-types/cloudfunctions-v1:projects.locations.functions',
      'name': function_name,
      'properties': {
          'parent':
              '/'.join([
                  'projects', ctx.env['project'], 'locations',
                  ctx.properties['location']
              ]),
          'function':
              function_name,
          'labels': {
              # Add the hash of the contents to trigger an update if the bucket
              # object changes
              'content-md5': m.hexdigest()
          },
          'sourceArchiveUrl':
              source_archive_url,
          'environmentVariables': {
              'codeHash': m.hexdigest(),
              'projectId': ctx.env['project']
          },
          'entryPoint':
              ctx.properties['entryPoint'],
          'timeout':
              ctx.properties['timeout'],
          'availableMemoryMb':
              ctx.properties['availableMemoryMb'],
          'runtime':
              ctx.properties['runtime'],
          'eventTrigger':
              {
                'resource': ctx.properties['eventTrigger']['resource'],
                'eventType': ctx.properties['eventTrigger']['eventType']
              }
      },
      'metadata': {
          'dependsOn': ['upload-function-code']
      }
  }
  resources = [build_step, cloud_function]

  return {
      'resources':
          resources,
      'outputs': [{
          'name': 'sourceArchiveUrl',
          'value': source_archive_url
      }, {
          'name': 'name',
          'value': '$(ref.' + function_name + '.name)'
      }]
  }