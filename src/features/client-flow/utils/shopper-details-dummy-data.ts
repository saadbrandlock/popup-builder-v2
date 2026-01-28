export const shopperDetailsDummyData = {
  code: 200,
  message: 'Successfully computed description section',
  data: [
    {
      data_id: 'shopper_description_section_descriptions',
      ui_template: {
        id: 'description',
        grid: {
          xs: 24,
        },
        props: {
          data: {
            overview: [
              {
                header: 'Who are Wrong Coupon Shoppers?',
                description:
                  '“PROMO-FOMO” Shoppers who obtain a faulty coupon and have a negative brand experience while attempting to redeem it.',
              },
              {
                header: 'Problem',
                description:
                  'Customers who enter a wrong coupon code at checkout, veer off-track and abandon their journey.',
              },
              {
                header: 'BrandLock Solution',
                description:
                  "Give a valid coupon to remedy the shopper's experience and complete checkout. Increase revenue.",
              },
            ],
            problemSS: [
              {
                url: 'https://debuficgraftb.cloudfront.net/reports/601/screenshots/wrong_coupon_1-1716800199260.png',
                title: 'bogo',
                hs_engaged_timming: null,
              },
            ],
            solutionSS: [
              {
                url: 'https://debuficgraftb.cloudfront.net/reports/601/screenshots/WC-desk-1745818215515.jpg',
                title: null,
              },
              {
                url: 'https://debuficgraftb.cloudfront.net/reports/601/screenshots/WC-mob-1745818231681.jpg',
                title: null,
              },
            ],
            shopper_icon:
              'https://debuficgraftb.cloudfront.net/dynamic-dashboard-assets/WRONG_COUPON_COLOR_SQ%201.png',
          },
          primaryBtnText: 'Wrong Coupon Shoppers Behavior',
          outlinedBtnText: 'View Solution',
        },
        style: {},
        gutter: null,
      },
      comp_id: 'descriptionsectiond',
      parent: 'sectionD',
      layout_config: {
        order: 1,
        visible: true,
      },
    },
  ],
};
