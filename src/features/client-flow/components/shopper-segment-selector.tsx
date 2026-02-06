import { useClientFlowStore } from '@/stores/clientFlowStore';
import { useGenericStore } from '@/stores/generic.store';
import { Select, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

interface ShopperSegmentSelectorProps {
  compact?: boolean;
}

const ShopperSegmentSelector: React.FC<ShopperSegmentSelectorProps> = ({ compact = false }) => {
  const { shoppers } = useGenericStore();
  const { actions, clientData } = useClientFlowStore();

  const [templateShopperGroups, setTemplateShopperGroups] = useState<
    { name: string; id: number }[]
  >([]);
  const [defaultShopper, setDefaultShopper] = useState<{
    label: string;
    value: number;
  } | null>(null);

  const onChangeShopper = (value: number) => {
    const selectedShopper = templateShopperGroups.find(
      (shopper) => shopper.id === value
    );

    if (selectedShopper) {
      actions.setActiveContentShopper({
        content: {
          name: selectedShopper.name,
          id: selectedShopper.id.toString(),
        },
      });
    }
  }

  useEffect(() => {
    if (clientData && clientData.length && shoppers.length) {
      const uniqueTemplateShoppers = Array.from(
        clientData
          .flatMap((template) => template.shoppers)
          .reduce((map, shopper) => map.set(shopper.id, shopper), new Map())
          .values()
      );

      const mainShopperIds = new Set(shoppers.map((s) => s.id));

      const result = uniqueTemplateShoppers.filter((shopper) =>
        mainShopperIds.has(shopper.id)
      );


      setTemplateShopperGroups(result);
      setDefaultShopper({ label: result[0].name, value: result[0].id });
      actions.setActiveContentShopper({
        content: {
          name: result[0].name,
          id: result[0].id.toString(),
        },
      });
    }
  }, [clientData, shoppers]);

  if (compact) {
    return (defaultShopper && (
      <div>
        <Select
          showSearch
          placeholder="Select a Shopper..."
          optionFilterProp="label"
          options={templateShopperGroups.map((shopper) => ({
            label: shopper.name,
            value: shopper.id,
          }))}
          onChange={onChangeShopper}
          defaultValue={defaultShopper.value}
          size="middle"
          className='w-full'
        />
      </div>
    )
    );
  }

  return (
    <>

      {defaultShopper && (
        <div>
          <Select
            showSearch
            placeholder="Select a Shopper..."
            optionFilterProp="label"
            options={templateShopperGroups.map((shopper) => ({
              label: shopper.name,
              value: shopper.id,
            }))}
              onChange={onChangeShopper}
            defaultValue={defaultShopper.value}
            size="large"
            className='w-full'
          />
        </div>
      )}
    </>
  );
};

export default ShopperSegmentSelector;
