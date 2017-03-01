import { MigawheelPage } from './app.po';

describe('migawheel App', function() {
  let page: MigawheelPage;

  beforeEach(() => {
    page = new MigawheelPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
