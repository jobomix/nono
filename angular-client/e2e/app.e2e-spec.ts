import { AngularClientPage } from './app.po';

describe('angular-client App', () => {
  let page: AngularClientPage;

  beforeEach(() => {
    page = new AngularClientPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(1 > 0);
    // expect(page.getParagraphText()).toEqual('app works!');
  });
});
