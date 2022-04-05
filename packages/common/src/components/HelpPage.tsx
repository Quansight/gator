import React from 'react';
import { style } from 'typestyle';
import screenshot from '../../style/conda-store-jupyterlab-screen-shot.png';

interface IHelpPageProps {
  condaStoreBaseUrl: string;
  height: number;
}

export function HelpPage(props: IHelpPageProps): JSX.Element {
  const { condaStoreBaseUrl, height } = props;
  return (
    <Panel height={height}>
      <div
        style={{
          overflow: 'scroll',
          height: '100%',
          padding: '0 20px'
        }}
      >
        <span id="jp-conda-store-help-top" />
        <h2>Conda Store Help</h2>
        <h3>Table of Contents</h3>

        <ul>
          <li>
            <a className={Style.Link} href="#jp-conda-store-help-section-one">
              Section one
            </a>
          </li>
          <li>
            <a className={Style.Link} href="#jp-conda-store-help-section-two">
              Section two
            </a>
          </li>
        </ul>

        <p>
          Having trouble with this JupyterLab extension? You may have better
          luck with the{' '}
          <a
            className={Style.Link}
            href={condaStoreBaseUrl}
            target="_blank"
            rel="noreferrer"
          >
            Conda Store web app.
          </a>
        </p>

        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>

        <div>
          <h3 id="jp-conda-store-help-section-one">Help Section One</h3>
          <p>
            <a className={Style.Link} href="#jp-conda-store-help-top">
              Back to top
            </a>
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et illum
            vero nulla sit pariatur quasi ipsa! Ducimus nam atque reprehenderit
            perferendis ratione beatae ab accusantium et laudantium dolores, rem
            autem.
            <img src={screenshot} alt="app screenshot" width={800} />
          </p>
        </div>

        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>
        <p>|</p>

        <div>
          <h3 id="jp-conda-store-help-section-two">Help Section Two</h3>
          <p>
            <a className={Style.Link} href="#jp-conda-store-help-top">
              Back to top
            </a>
          </p>
          <br />
          <details>
            <summary>Click to read more</summary>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Et illum
            vero nulla sit pariatur quasi ipsa! Ducimus nam atque reprehenderit
            perferendis ratione beatae ab accusantium et laudantium dolores, rem
            autem.
          </details>
        </div>
      </div>
    </Panel>
  );
}

function Panel({
  height,
  children
}: {
  height: number;
  children?: React.ReactNode;
}) {
  return <div className={Style.Panel(height)}>{children}</div>;
}

namespace Style {
  export const Panel = (height: number): string =>
    style({
      flexGrow: 1,
      borderLeft: '1px solid var(--jp-border-color2)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      paddingBottom: 20,
      height
    });

  const linkStyle = {
    color: 'var(--jp-content-link-color)',
    textDecoration: 'underline'
  };
  export const Link = style({
    ...linkStyle,
    $nest: {
      '&:hover': { ...linkStyle }
    }
  });
}
