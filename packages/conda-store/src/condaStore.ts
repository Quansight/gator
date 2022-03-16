/**
 * @file Client-side functions to call the conda-store REST API.
 *
 * Note: fetch is assumed to be global (execution environment: web browser).
 */

import yaml from 'yaml';
import { URLExt } from '@jupyterlab/coreutils';

export interface ICondaStoreEnvironment {
  name: string;
  build_id: number;
  id: number;
  namespace: {
    id: number;
    name: string;
  };
}

export enum BuildStatus {
  QUEUED = 'QUEUED',
  BUILDING = 'BUILDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}
export interface ICondaStoreBuild {
  status: BuildStatus;
  specification: {
    spec: {
      name: string;
      dependencies: string[];
    };
  };
}

export interface ICondaStorePackage {
  name: string;
  version: string;
  channel: {
    id: number;
    name: string;
  };
  id: number;
  license: string;
  sha256: string;
  build: string;
  summary: string;
}

export interface ICondaStoreChannel {
  id: number;
  last_update: string;
  name: string;
}

interface IPaginatedResult<T> {
  count?: number;
  data?: Array<T>;
  page?: number;
  size?: number;
  status?: string;
}

// See class CondaSpecification in conda_store_server/schema.py.
// https://github.com/Quansight/conda-store/blob/main/conda-store-server/conda_store_server/schema.py#L111
interface ICondaStoreSpecification {
  name: string;
  dependencies: Array<string>;
  channels?: Array<string>;
  prefix?: string;
}

/**
 * Construct the base URL for all endpoints available on the conda-store server.
 *
 * @param {string} serverURL - URL of the conda-store server; usually
 * 'http://localhost:5000'
 * @param {string} restEndpoint - Pathname plus query string without the
 * api/version prefix. Example: '/environment/?page=1&size=100'
 * @returns {string} Formatted base URL for all conda-store server endpoints.
 * Examples:
 * - URLExt.join('http://localhost:5000', '/') =>
 *   'http://localhost:5000/api/v1/'
 * - URLExt.join('http://localhost:5000', 'package/?search=python') =>
 *   'http://localhost:5000/api/v1/package/?search=python'
 */
function createApiUrl(serverURL: string, restEndpoint: string): string {
  return URLExt.join(serverURL, 'api', 'v1', restEndpoint);
}

/**
 * Get the status of the conda-store server.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @throws {Error} - Thrown if the request fails or the response is not ok.
 * @return {Promise<{status: string}>} Status of the conda-store server
 */
export async function condaStoreServerStatus(baseUrl: string): Promise<{
  status: string;
}> {
  let response;
  const url = createApiUrl(baseUrl, '/');
  try {
    response = await fetch(url);
  } catch {
    throw new Error(`Failed to reach the conda-store server at ${url}`);
  }
  if (response.ok) {
    return await response.json();
  } else {
    throw new Error(
      `Unexpected response from the conda-store server: ${response}`
    );
  }
}

/**
 * Fetch all conda-store environments.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @return {Promise<IPaginatedResult<ICondaStoreEnvironment>>} All environments visible to conda-store.
 */
export async function fetchEnvironments(
  baseUrl: string,
  page = 1,
  size = 100
): Promise<IPaginatedResult<ICondaStoreEnvironment>> {
  const url = createApiUrl(baseUrl, `/environment/?page=${page}&size=${size}`);
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    return {};
  }
}

/**
 * Search all packages (both installed and not installed) for a package.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} term - Search term; both name and descriptions are searched
 * @return {Promise<Array<ICondaStorePackage>>} Packages matching the search term.
 */
export async function searchPackages(
  baseUrl: string,
  term: string
): Promise<IPaginatedResult<ICondaStorePackage>> {
  const url = createApiUrl(baseUrl, `/package/?search=${term}`);
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    return {};
  }
}

export async function getAllPackagesMatchingSearch(
  baseUrl: string,
  term: string
): Promise<Array<ICondaStorePackage>> {
  let matches: Array<ICondaStorePackage> = [];
  let count = 0;
  let page = 0;
  let size = 100;
  let data: Array<ICondaStorePackage>;
  let hasMorePackages = true;

  while (hasMorePackages) {
    ({ count, data, page, size } = await fetchPackages(
      baseUrl,
      page + 1,
      size,
      term,
      true
    ));
    console.log(
      `fetched page ${page} of ${
        count / size
      } pages for search term ${term} with baseUrl ${baseUrl}`
    );
    hasMorePackages = page * size < count;
    matches = [...matches, ...data];
  }

  return matches;
}

/**
 * Fetch the packages available in the conda-store database.
 *
 * Results are distinct on name and version.
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of available packages
 */
export async function fetchPackages(
  baseUrl: string,
  page = 1,
  size = 100,
  search = '',
  isExact = false
): Promise<IPaginatedResult<ICondaStorePackage>> {
  const url = createApiUrl(
    baseUrl,
    `/package/?page=${page}&size=${size}&distinct_on=name&distinct_on=version&sort_by=name` +
      (search ? `&search=${encodeURIComponent(search)}` : '') +
      (isExact ? '&exact=1' : '')
  );
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  } else {
    return {};
  }
}

export async function fetchBuild(
  baseUrl: string,
  buildId: number
): Promise<ICondaStoreBuild> {
  const url = createApiUrl(baseUrl, `/build/${buildId}/`);
  const response = await fetch(url);
  if (response.ok) {
    const json = await response.json();
    return json.data;
  }
}

export async function fetchCurrentBuildId(
  baseUrl: string,
  namespace: string,
  environment: string
): Promise<number | void> {
  const url = createApiUrl(
    baseUrl,
    `/environment/${namespace}/${environment}/`
  );
  const response = await fetch(url);
  if (response.ok) {
    const json = await response.json();
    return json.data.current_build_id;
  }
}

/**
 * List the installed packages for the given environment and namespace.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Name of the namespace to be searched
 * @param {string} environment - Name of the environment to be searched
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of packages in the given namespace/environment
 * combination
 */
export async function fetchEnvironmentPackages(
  baseUrl: string,
  currentBuildId: number
): Promise<Array<ICondaStorePackage>> {
  let packages: Array<ICondaStorePackage> = [];
  let data: Array<ICondaStorePackage>;
  let count = 1;
  let page = 1;
  const size = 100;

  while (packages.length < count) {
    const url = createApiUrl(
      baseUrl,
      `/build/${currentBuildId}/packages/?page=${page}&size=${size}&sort_by=name`
    );
    const response = await fetch(url);
    ({ data, count } = await response.json());
    page++;
    packages = [...packages, ...data];
  }

  return packages;
}

export async function fetchSpecifiedPackages(
  baseUrl: string,
  namespace: string,
  environment: string
): Promise<Array<string>> {
  if (namespace === undefined || environment === undefined) {
    console.error(
      `Error: invalid arguments to fetchSpecifiedPackages: envNamespace ${namespace} envName ${environment}`
    );
    return [];
  }

  const currentBuildId = await fetchCurrentBuildId(
    baseUrl,
    namespace,
    environment
  );

  if (currentBuildId === undefined) {
    return [];
  }

  const currentBuild = await fetchBuild(
    baseUrl,
    currentBuildId as number
  );

  if (currentBuild === undefined) {
    return [];
  }

  const { dependencies } = currentBuild.specification.spec;
  return dependencies;
}

/**
 * List the packages for the given build.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {number} build_id - Build for which the packages are to be listed
 * @return {Promise<IPaginatedResult<ICondaStorePackage>>} List of packages that are part of the
 * given build
 */
export async function fetchBuildPackages(
  baseUrl: string,
  build_id: number
): Promise<IPaginatedResult<ICondaStorePackage>> {
  const url = createApiUrl(
    baseUrl,
    `/build/${build_id}/packages/?sort_by=name`
  );
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  }
  return {};
}

/**
 * Fetch the channels. Channels are remote repositories containing conda packages.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @return {Promise<Array<ICondaStoreChannel>>} List of all possible channels from which packages
 * may be downloaded..
 */
export async function fetchChannels(
  baseUrl: string
): Promise<Array<ICondaStoreChannel>> {
  const url = createApiUrl(baseUrl, '/channel/');
  const response = await fetch(url);
  if (response.ok) {
    return await response.json();
  }
  return [];
}

/**
 * Create a new environment from a specification.
 *
 * @async
 * @param {string} namespace - Namespace for the environment
 * @param {string} specification - YAML-formatted specification containing environment name and
 * dependencies
 * @returns {Promise<Response>}
 */
export async function specifyEnvironment(
  baseUrl: string,
  namespace: string,
  specification: string
): Promise<Response> {
  const url = createApiUrl(baseUrl, '/specification/');
  return await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      namespace: namespace,
      specification
    })
  });
}

/**
 * Create a new environment from a list of package names.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Namespace into which the environment is to be created.
 * @param {string} environment - Name of the new environment.
 * @param {Array<string>} dependencies - List of string package names to be added to the spec.
 * @returns {Promise<void>}
 */
export async function createEnvironment(
  baseUrl: string,
  namespace: string,
  environment: string,
  dependencies: Array<string>,
): Promise<Response> {
  const specification: ICondaStoreSpecification = {
    name: environment,
    dependencies
  };
  return await specifyEnvironment(
    baseUrl,
    namespace,
    yaml.stringify(specification)
  );
}

/**
 * Clone an existing environment.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} existingNamespace - Namespace of the existing environment.
 * @param {string} existingEnvironment - Name of the existing environment.
 * @param {string} namespace - Namespace into which the clone will be created.
 * @param {string} environment - Name of the new environment, which will be a clone of the existing environment.
 * @param {Array<string>} dependencies - List of string package names to be added to the spec.
 * @returns {Promise<void>}
 */
export async function cloneEnvironment(
  baseUrl: string,
  existingNamespace: string,
  existingEnvironment: string,
  namespace: string,
  environment: string
): Promise<Response> {
  // Get specification for existing environment
  const specificationResponse = await exportEnvironment(
    baseUrl,
    existingNamespace,
    existingEnvironment
  );

  // Modify specification so that it uses the provided environment name
  const specificationYaml = await specificationResponse.text();
  const specification: ICondaStoreSpecification = yaml.parse(specificationYaml);
  specification.name = environment;

  // Pass specification to the API to create new environment based on the
  // provided existiing environment
  const response = await specifyEnvironment(
    baseUrl,
    namespace,
    yaml.stringify(specification)
  );
  if (!response.ok) {
    console.error(await response.json());
    throw new Error('Could not clone environment, see browser console.');
  }
  return response;
}

/**
 * Remove an environment.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Namespace the environment belongs to.
 * @param {string} environment - Name of the environment.
 * @returns {Promise<void>}
 */
export async function removeEnvironment(
  baseUrl: string,
  namespace: string,
  environment: string
): Promise<void> {
  const url = createApiUrl(
    baseUrl,
    `/environment/${namespace}/${environment}/`
  );
  await fetch(url, {
    method: 'DELETE'
  });
  return;
}

/**
 * Remove one or more packages from an environment.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Namespace in which the environment resides
 * @param {string} environment - Environment for which packages are to be removed
 * @param {Array<string>} packages - Packages to remove
 * @returns {Promise<void>}
 */
export async function removePackages(
  baseUrl: string,
  namespace: string,
  environment: string,
  packages: Array<string>
): Promise<void> {
  const specDeps = await fetchSpecifiedPackages(
    baseUrl,
    namespace,
    environment
  );
  const toDelete = new Map(
    packages.map(pkg => {
      const [name, version = ''] = pkg.split('=');
      return [name, version];
    })
  );
  // Reconstruct the specification for the current environment, minus the packages to delete
  const nextSpecDeps = specDeps
    .map(dep => dep.split('='))
    .filter(([name, version]) => !toDelete.has(name))
    .map(([name, version]) => [name, version].join('='));

  const response = await createEnvironment(
    baseUrl,
    namespace,
    environment,
    nextSpecDeps
  );

  const {
    data: { build_id: buildId }
  } = await response.json();

  const status = await getFinalBuildStatus(baseUrl, buildId);
  if (status === BuildStatus.FAILED) {
    throw new Error('Error building new environment!');
  }
}

/**
 * Export an environment as a yaml file.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Namespace of the environment to be exported
 * @param {string} environment - Name of the environment
 * @returns {Promise<Response>} Response containing the yaml of the environment specification
 * in the response text
 */
export async function exportEnvironment(
  baseUrl: string,
  namespace: string,
  environment: string
): Promise<Response> {
  // First get the build ID of the requested environment
  const currentBuildId = await fetchCurrentBuildId(
    baseUrl,
    namespace,
    environment
  );
  if (currentBuildId === undefined) {
    throw new Error(
      'Could not fetch current build id while attempting to export environment'
    );
  }

  // Then get the data for the current build
  const url = createApiUrl(baseUrl, `/build/${currentBuildId}`);
  const response = await fetch(url);
  if (!response.ok) {
    console.error(await response.text());
    throw new Error(
      `Could not fetch the current build while attempting to export environment. Conda Store server responded with error code ${response.status}. See browser console for error response body.`
    );
  }

  // Then extract the spec-file data, convert to yaml, and return as response
  const {
    data: {
      specification: { spec }
    }
  } = await response.json();
  // TODO: create endpoint in conda store server api to return the
  // environment's spec as yaml so we don't have to do this hack
  // where we cast the response from json to yaml
  const specificationYaml = yaml.stringify(spec);
  const blob = new Blob([specificationYaml], { type: 'text/yaml' });
  const yamlResponse = new Response(blob, response);
  return yamlResponse;
}

/**
 * Add packages to an environment.
 *
 * If a package already exists in the environment, no change will be made to that package.
 *
 * @async
 * @param {string} baseUrl - Base URL of the conda-store server; usually http://localhost:5000
 * @param {string} namespace - Namespace into which the environment resides.
 * @param {string} environment - Name of the environment.
 * @param {Array<string>} packages - List of packages in "name=version" format to add to the environment.
 * @returns {Promise<void>}
 */
export async function addPackages(
  baseUrl: string,
  namespace: string,
  environment: string,
  packages: Array<string>
): Promise<void> {
  const specDeps = await fetchSpecifiedPackages(
    baseUrl,
    namespace,
    environment
  );

  // Generate a specification for the new environment including the installed as well as new packages
  const nameToVersion = (deps: string[]) =>
    new Map(
      deps.map(dep => {
        const [name, version = ''] = dep.split('=');
        return [name, version];
      })
    );
  const requested = nameToVersion(packages);
  const next = nameToVersion(specDeps);
  requested.forEach((version, name) => {
    next.set(name, version);
  });
  const nextSpec = Array.from(next).map(([name, version]) =>
    [name, version].join('=')
  );
  console.log(environment, 'nextSpec', nextSpec);
  const response = await createEnvironment(
    baseUrl,
    namespace,
    environment,
    nextSpec
  );
  const {
    data: { build_id: buildId }
  } = await response.json();

  const status = await getFinalBuildStatus(baseUrl, buildId);
  if (status === BuildStatus.FAILED) {
    throw new Error('Error building new environment!')
  }
}

// Returns promise that resolves with either COMPLETED or FAILED
export function getFinalBuildStatus(
  baseUrl: string,
  buildId: number,
  waitTime = 5000
): Promise<'COMPLETED' | 'FAILED'> {
  return new Promise(resolve => {
    const getBuildStatus = async () => {
      const { status } = await fetchBuild(baseUrl, buildId);
      console.log(`Build id ${buildId} status: ${status}`);
      if (status === BuildStatus.COMPLETED || status === BuildStatus.FAILED) {
        resolve(status);
      } else {
        // wait a bit, then check again
        setTimeout(getBuildStatus, waitTime);
      }
    };
    getBuildStatus();
  });
}
