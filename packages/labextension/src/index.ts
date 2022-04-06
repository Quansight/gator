import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  CondaEnvWidget,
  condaIcon,
  CONDA_WIDGET_CLASS,
  IEnvironmentManager
} from '@mamba-org/gator-common';
import { CondaStoreEnvironmentManager } from '@mamba-org/conda-store';
import { INotification } from 'jupyterlab_toastify';
import { managerTour } from './tour';
import {
  companionID,
  CompanionValidator,
  ICompanionValidator
} from './validator';

const CONDAENVID = '@mamba-org/gator-lab:plugin';
const CONDASTOREENVID = '@mamba-org/conda-store:plugin';
const TOUR_DELAY = 1000;
const TOUR_TIMEOUT = 5 * TOUR_DELAY + 1;

/**
 * Activate the conda-store menu entry.
 *
 * @async
 * @param {JupyterFrontEnd} app - Handle to the Jupyter frontend
 * @param {ICommandPalette | null} palette - Jupyterlab command palette
 * @param {IMainMenu | null} menu - Jupyterlab menu where the package manager will be launched from
 * @param {ILayoutRestorer | null} restorer - Widget which restores the layout when the app is
 * reloaded
 * @return {Promise<void>}
 */
async function activateCondaStoreEnv(
  app: JupyterFrontEnd,
  settingsRegistry: ISettingRegistry | null,
  palette: ICommandPalette | null,
  menu: IMainMenu | null,
  restorer: ILayoutRestorer | null
): Promise<CondaStoreEnvironmentManager> {
  let tour: any;
  const { commands, shell } = app;
  const pluginNamespace = 'conda-store-env';
  const command = 'jupyter_conda_store:open-ui';

  // Use gator-lab for a single place for configuration
  const settings = await settingsRegistry?.load(CONDAENVID);
  const model = new CondaStoreEnvironmentManager(settings);

  // Track and restore the widget state
  const tracker = new WidgetTracker<MainAreaWidget<CondaEnvWidget>>({
    namespace: pluginNamespace
  });
  let condaWidget: MainAreaWidget<CondaEnvWidget>;

  commands.addCommand(command, {
    label: 'Conda Store Packages Manager',
    execute: () => {
      app.restored.then(() => {
        let timeout = 0;

        const delayTour = (): void => {
          setTimeout(() => {
            timeout += TOUR_DELAY;
            if (condaWidget?.isVisible && tour) {
              commands.execute('jupyterlab-tour:launch', {
                id: tour.id,
                force: false
              });
            } else if (timeout < TOUR_TIMEOUT) {
              delayTour();
            }
          }, 1000);
        };

        if (commands.hasCommand('jupyterlab-tour:add')) {
          if (!tour) {
            commands
              .execute('jupyterlab-tour:add', {
                tour: managerTour as any
              })
              .then(result => {
                tour = result;
              });
          }

          delayTour();
        }
      });

      if (!condaWidget || condaWidget.isDisposed) {
        condaWidget = new MainAreaWidget({
          content: new CondaEnvWidget(model)
        });
        condaWidget.addClass(CONDA_WIDGET_CLASS);
        condaWidget.id = pluginNamespace;
        condaWidget.title.label = 'Conda Store';
        condaWidget.title.caption = 'Conda Store Packages Manager';
        condaWidget.title.icon = condaIcon;
        model.getServerStatus().catch((error: any) => {
          INotification.error(`${error}`);
        });
      }

      if (!tracker.has(condaWidget)) {
        // Track the state of the widget for later restoration
        tracker.add(condaWidget);
      }
      if (!condaWidget.isAttached) {
        // Attach the widget to the main work area if it's not there
        shell.add(condaWidget, 'main');
      }
      shell.activateById(condaWidget.id);
    }
  });

  // Add command to command palette
  if (palette) {
    palette.addItem({ command, category: 'Settings' });
  }

  // Handle state restoration.
  if (restorer) {
    restorer.restore(tracker, {
      command,
      name: () => pluginNamespace
    });
  }

  // Add command to settings menu
  if (menu) {
    menu.settingsMenu.addGroup([{ command: command }], 999);
  }

  return model;
}

async function activateCompanions(
  app: JupyterFrontEnd,
  envManager: IEnvironmentManager,
  settingsRegistry: ISettingRegistry,
  palette: ICommandPalette | null
): Promise<ICompanionValidator> {
  const { commands, serviceManager } = app;
  const command = 'jupyter_conda:companions';
  const settings = await settingsRegistry.load(CONDAENVID);

  const validator = new CompanionValidator(
    serviceManager.kernelspecs,
    envManager,
    settings
  );

  commands.addCommand(command, {
    label: 'Validate kernels compatibility',
    execute: () => {
      validator.validate(serviceManager.kernelspecs.specs);
    }
  });

  // Add command to command palette
  if (palette) {
    palette.addItem({ command, category: 'Troubleshooting' });
  }

  return validator;
}

/**
 * Initialization data for the @mamba-org/conda-store extension.
 */
const condaStoreManager: JupyterFrontEndPlugin<IEnvironmentManager> = {
  id: CONDASTOREENVID,
  autoStart: true,
  activate: activateCondaStoreEnv,
  optional: [ISettingRegistry, ICommandPalette, IMainMenu, ILayoutRestorer],
  provides: IEnvironmentManager
};

/**
 * Initialization data for the jupyterlab_kernel_companions extension.
 */
const companions: JupyterFrontEndPlugin<ICompanionValidator> = {
  id: companionID,
  autoStart: true,
  activate: activateCompanions,
  requires: [IEnvironmentManager, ISettingRegistry],
  optional: [ICommandPalette],
  provides: ICompanionValidator
};

const extensions = [condaStoreManager, companions];

export default extensions;
