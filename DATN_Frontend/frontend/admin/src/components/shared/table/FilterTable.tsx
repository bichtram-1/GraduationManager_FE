import {
  DeleteOutlined,
  DownloadOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  UseMutationResult,
  UseQueryResult,
} from '@tanstack/react-query';
import type { ModalProps, TableColumnsType, TablePaginationConfig } from 'antd';
import {
  Button,
  Card,
  Flex,
  Form,
  Modal,
  Table,
  message,
} from 'antd';
import { AxiosError } from 'axios';
import _, { debounce } from 'lodash';
import React, { cloneElement, ReactNode, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BaseListParams, ListResponseTypeObject } from '@shared/types/GeneralType';
import { deepCompareObjects } from '@shared/utils/utils';
import { useScrollContainer } from '../../../hooks/ScrollContainerProvider';

// Chiều cao ước tính của thanh phân trang ghim (position: sticky, xem .ant-table-pagination
// trong App.css) — dùng làm offsetScroll để thanh cuộn ngang ghim (Table.sticky) của AntD
// nằm sát ngay phía trên, không đè lên thanh phân trang.
const STICKY_PAGINATION_HEIGHT = 57;

interface RecordWithId {
  id?: string;
  value?: string;
  key?: string;
  title?: string;
  code?: string;
  name?: string;
}

interface ApiErrorData {
  message?: string;
  errors?: Record<string, string[]>;
}

interface CreateVariables<T, P> {
  body: T;
  params: P;
}

interface UpdateVariables<T, P> {
  id: string;
  body: T;
  index: number;
  params: P;
}

interface DeleteVariables<P> {
  id: string;
  params: P;
}

interface ActionTableInfoProps {
  isDetail?: boolean;
  isEdit?: boolean;
  isDelete?: boolean;
  isDeleteDisabled?: (record: unknown) => boolean;
  customAction?: (record: unknown, index: number) => ReactNode;
  detailInfo?: CRUDTableInfoType<(id: string, enable: boolean) => UseQueryResult<unknown, Error>>;
}

type CRUDTableInfoType<F = () => void> =
  | { type: 'link'; link: string; }
  | { type: 'modal'; modalInfo: ModalInfoType<F> };

interface ModalInfoType<F = () => void> {
  modalContent: ReactNode;
  modalProps: ModalProps;
  modalFunc: F;
}

export interface FilterTableProps<
  TList = unknown,
  TDetail = TList,
  TCreate = TList,
  TUpdate = Partial<TDetail>,
> {
  title?: string;
  showSizeChanger?: boolean;
  pageTitle?: string;
  pageSubtitle?: string;
  createButtonLabel?: string;
  columns?: TableColumnsType<TList>;
  useQueryHook: (
    params: BaseListParams
  ) => UseQueryResult<ListResponseTypeObject<TList>, Error>;
  paramVariables?: BaseListParams;
  filterRender?: () => ReactNode;
  actions?: ActionTableInfoProps;
  createInfo?: CRUDTableInfoType<
    UseMutationResult<TDetail, AxiosError, CreateVariables<TCreate, BaseListParams>>
  >;
  updateInfo?: CRUDTableInfoType<
    UseMutationResult<TDetail, AxiosError, UpdateVariables<TUpdate, BaseListParams>>
  >;
  deleteInfo?: CRUDTableInfoType<
    UseMutationResult<TList, AxiosError, DeleteVariables<BaseListParams>>
  >;
  detailInfo?: CRUDTableInfoType<
    (id: string, enable: boolean) => UseQueryResult<TDetail, Error>
  >;
  exportInfo?: CRUDTableInfoType<UseMutationResult<TList, AxiosError>>;
  formatInitialValues?: (data: TDetail) => Record<string, unknown>;
  formatFormValues?: (values: Record<string, unknown>) => TCreate | TUpdate;
  enableSelectRow?: boolean;
  extraHeaderActions?: ReactNode;
  extraActions?: ReactNode;
}

const initParams = { page: 1, limit: 10 };
const { confirm } = Modal;
const InfoModalType = 'modal' as const;
const InfoLinkType = 'link' as const;
const CreateModalType = 'create' as const;
const UpdateModalType = 'update' as const;
const DetailModalType = 'detail' as const;

const FilterTable = <
  TList,
  TDetail = TList,
  TCreate = TList,
  TUpdate = Partial<TDetail>,
>({
  title,
  pageTitle,
  pageSubtitle,
  createButtonLabel,
  columns,
  useQueryHook,
  paramVariables,
  actions = {
    isDetail: true,
    isEdit: true,
    isDelete: true,
    customAction: () => null,
  },
  createInfo,
  updateInfo,
  detailInfo,
  exportInfo,
  deleteInfo,
  filterRender,
  formatInitialValues,
  formatFormValues,
  extraHeaderActions,
  extraActions,
  showSizeChanger = true,
}: FilterTableProps<TList, TDetail, TCreate, TUpdate>) => {
  const hasPageHeader = !!pageTitle;

  const { t } = useTranslation();
  const scrollContainerRef = useScrollContainer();
  const [form] = Form.useForm();
  const [formModal] = Form.useForm();
  const [internalParams, setInternalParams] = useState<BaseListParams>(
    paramVariables || initParams
  );

  useEffect(() => {
    if (!paramVariables) return;
    // merge new parent paramVariables with current filter form values to preserve inputs
    const formValues = form.getFieldsValue();
    const mergedParams: BaseListParams & Record<string, unknown> = { ...internalParams, ...paramVariables };

    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== undefined && formValues[key] !== null) {
        mergedParams[key] = formValues[key];
      }
    });

    if (!_.isEqual(mergedParams, internalParams)) {
      setInternalParams(mergedParams);
    }
  }, [paramVariables]);

  const [openModal, setOpenModal] = useState<{
    type: 'create' | 'update' | 'detail';
    open: boolean;
    id: string;
    index: number;
  }>({ open: false, id: '', index: -1, type: CreateModalType });

  const { data, isLoading } = useQueryHook(internalParams as BaseListParams);

  const detailHook = detailInfo?.type === InfoModalType && detailInfo?.modalInfo?.modalFunc;
  const { data: detail, isLoading: isLoadingDetail } = detailHook
    ? detailHook(openModal?.id, openModal?.type === UpdateModalType || openModal?.type === DetailModalType)
    : { data: undefined, isLoading: false };

  const exportMutation = exportInfo?.type === InfoModalType && exportInfo?.modalInfo?.modalFunc;
  const updateMutation = updateInfo?.type === InfoModalType && updateInfo?.modalInfo?.modalFunc;
  const deleteMutation = deleteInfo?.type === InfoModalType && deleteInfo?.modalInfo?.modalFunc;
  const createMutation = createInfo?.type === InfoModalType && createInfo?.modalInfo?.modalFunc;

  const classCssAciton = 'w-8 h-8 hover:bg-gray-100 transition-colors';

  useEffect(() => {
    if (!detail) return;
    const clone = _.cloneDeep(detail);
    const formattedInitialValues = formatInitialValues?.(clone) || clone;

    formModal.setFieldsValue(formattedInitialValues);
  }, [detail, formatInitialValues]);

  const handleChangeFilterForm = useCallback(
    debounce(() => {
      const values = form.getFieldsValue();
      const newParams = { ...internalParams, ...values, page: 1 };
      setInternalParams(newParams);
    }, 500),
    [internalParams, form]
  );

  const handleChangeTable = (pagination: TablePaginationConfig) => {
    setInternalParams((prev: BaseListParams) => {
      return {
        ...(prev as BaseListParams),
        page:
          pagination?.pageSize !== internalParams.limit ? 1 : pagination?.current || 1,
        limit: pagination?.pageSize || internalParams.limit,
      };
    });
  };

  const showDeleteConfirm = (id: string, record: unknown) => {
    let name = '';
    if (record) {
      const r = record as RecordWithId;
      name = r.title || r.code || r.name || '';
    }

    confirm({
      centered: true,
      title: null,
      icon: null,
      content: (
        <div className="text-center">
          <ExclamationCircleFilled className="text-[40px] leading-none text-btnDelete" />
          <div className="mt-3 font-bold text-xl">
            {t('delete_title')}
          </div>
          <div className="text-sm mt-2">
            {name ? (
              <span>Bạn có chắc chắn muốn xóa <strong>&quot;{name}&quot;</strong>? Hành động này không thể hoàn tác.</span>
            ) : (
              t('delete_content')
            )}
          </div>
        </div>
      ),
      okText: t('delete'),
      okButtonProps: { type: 'primary', danger: true },
      cancelButtonProps: { type: 'default', danger: true },
      cancelText: t('cancel_btn'),
      className: 'custom-confirm-modal',
      onOk() {
        if (id && deleteMutation) {
          deleteMutation.mutate(
            { id, params: internalParams },
            {
              onError: (error: AxiosError) => {
                const backendMessage = (error?.response?.data as ApiErrorData | undefined)?.message;
                if (backendMessage) {
                  message.error(backendMessage);
                }
              },
            }
          );
        } else {
          console.log(t('not_id'));
        }
      },
    });
  };

  const handleSubmitModal = (values: Record<string, unknown>) => {
    const transformedValues = formatFormValues?.(values) || values;
    const initialBody = detail || {};
    const body = deepCompareObjects(transformedValues, initialBody);

    if (openModal?.type === UpdateModalType && updateMutation) {
      updateMutation.mutate(
        {
          id: openModal?.id,
          body: body as TUpdate,
          index: openModal?.index,
          params: internalParams,
        },
        {
          onSuccess: () => {
            handleCancelModal();
          },
          onError: (error: AxiosError) => {
            const errData = error?.response?.data as ApiErrorData | undefined;
            const validationErrors = errData?.errors;
            if (validationErrors) {
              const firstErrorKey = Object.keys(validationErrors)[0];
              const firstError = validationErrors[firstErrorKey][0];
              message.error(firstError);
            } else {
              message.error(errData?.message || error?.message || 'Cập nhật thất bại!');
            }
          }
        }
      );
    } else if (createMutation) {
      createMutation.mutate(
        { body: body as TCreate, params: internalParams },
        {
          onSuccess: () => {
            handleCancelModal();
          },
          onError: (error: AxiosError) => {
            const errData = error?.response?.data as ApiErrorData | undefined;
            const validationErrors = errData?.errors;
            if (validationErrors) {
              const firstErrorKey = Object.keys(validationErrors)[0];
              const firstError = validationErrors[firstErrorKey][0];
              message.error(firstError);
            } else {
              message.error(errData?.message || error?.message || 'Thêm mới thất bại!');
            }
          }
        }
      );
    }
  };

  const handleCancelModal = () => {
    setOpenModal({ open: false, id: '', index: -1, type: CreateModalType });
    formModal.resetFields();
  };

  const initColumns: TableColumnsType<TList> = [
    ...(columns || []),
    ...(actions?.isDetail || actions?.isEdit || actions?.isDelete || actions?.customAction ? [
      {
        title: t('action'),
        key: 'action',
        align: 'center' as const,
        fixed: 'right' as const,
        onCell: () => ({
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
          },
          className: 'cursor-auto pointer-events-none',
        }),
        render: (_: unknown, record: TList, index: number) => {
          return (
            <Flex
              gap={4}
              className="content-center justify-center justify-items-center items-center"
            >
              {actions?.isDetail &&
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    if (actions?.detailInfo?.type === InfoLinkType) {
                      const recordWithId = record as RecordWithId;
                      console.log('Navigate to detail:', recordWithId?.id || recordWithId?.value);
                    } else {
                      const recordWithId = record as RecordWithId;
                      const recordId = recordWithId?.id || recordWithId?.value || '';
                      setOpenModal({
                        open: true,
                        id: recordId,
                        index,
                        type: DetailModalType,
                      });
                    }
                  }}
                  className={`flex items-center rounded-full
                   justify-center cursor-pointer pointer-events-auto ${classCssAciton} text-primary`}
                >
                  <EyeOutlined />
                </div>
              }

              {actions?.isEdit &&
                <div
                  onClick={(event) => {
                    event.stopPropagation();
                    const recordWithId = record as RecordWithId;
                    const recordId = recordWithId?.id || recordWithId?.value || '';
                    setOpenModal({
                      open: true,
                      id: recordId,
                      index,
                      type: UpdateModalType,
                    });
                  }}
                  className={`flex items-center
                   justify-center
                   cursor-pointer pointer-events-auto rounded-full ${classCssAciton}`}
                >
                  <FormOutlined />
                </div>
              }

              {actions?.isDelete &&
                (() => {
                  const disabled = actions?.isDeleteDisabled?.(record) ?? false;
                  return (
                    <div
                      onClick={(event) => {
                        event.stopPropagation();
                        if (disabled) return;
                        const recordWithId = record as RecordWithId;
                        const recordId = recordWithId?.id || recordWithId?.value || '';
                        showDeleteConfirm(recordId, record);
                      }}
                      className={`flex items-center rounded-full
                       justify-center pointer-events-auto ${classCssAciton} ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <DeleteOutlined className="text-red-500" />
                    </div>
                  );
                })()
              }

                {actions?.customAction &&
                  actions?.customAction(record, index)
                }

            </Flex>
          );
        },
      },
    ] : []),
  ];

  const renderCreateButton = () => {
    if (!createInfo?.type) return null;
    return (
      <Button
        type="primary"
        icon={<PlusOutlined className="text-white" />}
        onClick={() => {
          setOpenModal({ open: true, id: '', index: -1, type: CreateModalType });
        }}
        className="!h-10 !rounded-[8px] !bg-primary !px-5 !flex !items-center !gap-2 !font-medium hover:!bg-blueDark"
      >
        <span className="text-white text-base font-medium text-center w-full">
          {createButtonLabel || `${t('add_new_btn')} ${title || ''}`}
        </span>
      </Button>
    );
  };

  return (
    <>
      <Form form={form} onValuesChange={handleChangeFilterForm}>
        <Flex vertical gap={24} align="stretch">
          {hasPageHeader && (
            <Flex justify="space-between" align="center">
              <div>
                <h1 className="text-[34px] font-bold text-navyDark leading-[40px] m-0">
                  {pageTitle}
                </h1>
                {pageSubtitle && (
                  <p className="text-[18px] text-grayDark leading-[26px] mt-2 m-0">
                    {pageSubtitle}
                  </p>
                )}
              </div>
              <Flex align="center" gap={12}>
                {exportInfo?.type && exportMutation && (
                  <Button
                    type="primary"
                    ghost
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      exportMutation.mutate({
                        params: { ...internalParams },
                      })
                    }
                  >
                    {t('export_to_excel')}
                  </Button>
                )}
              </Flex>
            </Flex>
          )}

          <Card className="filter-table-card">
            <div className="filter-table-header flex flex-col gap-4 mb-4">
              <Flex justify="space-between" align="center">
                {title && (
                  <span className="filter-table-title">
                    {title} {data?.total !== undefined ? `(${data.total})` : ''}
                  </span>
                )}

                <Flex align="center" gap={12}>
                  {extraHeaderActions}
                  {extraActions}
                  {renderCreateButton()}
                  {exportInfo?.type && exportMutation && (
                    <Button
                      type="primary"
                      ghost
                      icon={<DownloadOutlined />}
                      onClick={() =>
                        exportMutation.mutate({
                          params: { ...internalParams },
                        })
                      }
                    >
                      {t('export_to_excel')}
                    </Button>
                  )}
                </Flex>
              </Flex>

              {filterRender?.()}
            </div>

            <Table
              rowKey={(record: TList) => {
                const r = record as RecordWithId;
                return r.id ?? r.value ?? r.key ?? '';
              }}
              columns={initColumns}
              dataSource={data?.rows}
              loading={isLoading || isLoadingDetail}
              pagination={{
                total: data?.total,
                current: internalParams?.page,
                pageSize: internalParams?.limit,
                position: ['bottomCenter'],
                showQuickJumper: false,
                showSizeChanger: showSizeChanger,
                showTotal(total, range) {
                  return <span className="pl-2">{`${t('showing')} ${range[0]} ${t('to')} ${range[1]} ${t('of')} ${total} ${t('entries')}`}</span>;
                },
              }}
              onChange={handleChangeTable}
              scroll={{ x: 'max-content' }}
              sticky={{
                offsetHeader: 0,
                offsetScroll: STICKY_PAGINATION_HEIGHT,
                getContainer: () => scrollContainerRef?.current || window,
              }}
            />
          </Card>
        </Flex>
      </Form>

      <Modal
        centered
        open={openModal?.open}
        onCancel={handleCancelModal}
        onOk={() => formModal.submit()}
        loading={isLoadingDetail}
        destroyOnHidden
        maskClosable={false}
        width={512}
        okText={
          openModal.type === CreateModalType
            ? t('add_new_btn')
            : openModal.type === UpdateModalType
              ? t('update_btn')
              : undefined
        }
        cancelText={t('cancel_btn')}
        okButtonProps={{ className: '!h-10 !px-4 !rounded-lg !text-base !font-medium' }}
        cancelButtonProps={{ className: '!h-10 !px-4 !rounded-lg !border-graySilver !text-base !font-medium' }}
        {...(openModal.type === CreateModalType && createInfo?.type === InfoModalType
          ? createInfo.modalInfo.modalProps
          : openModal.type === UpdateModalType && updateInfo?.type === InfoModalType
            ? updateInfo.modalInfo.modalProps
            : openModal.type === DetailModalType && detailInfo?.type === InfoModalType
              ? detailInfo.modalInfo.modalProps
              : {})}
      >
        <Form
          form={formModal}
          layout="vertical"
          onFinish={handleSubmitModal}
          className="overflow-y-auto overflow-x-hidden max-h-[75vh] px-1"
          clearOnDestroy
          scrollToFirstError={{
            behavior: 'instant',
            focus: true,
            block: 'center',
          }}
        >
          {openModal.type === CreateModalType &&
            createInfo?.type === InfoModalType &&
            createInfo.modalInfo.modalContent}
          {openModal.type === UpdateModalType &&
            updateInfo?.type === InfoModalType &&
            updateInfo.modalInfo.modalContent &&
            cloneElement(
              updateInfo.modalInfo.modalContent as React.ReactElement,
              { detail }
            )}
          {openModal.type === DetailModalType &&
            detailInfo?.type === InfoModalType &&
            detailInfo.modalInfo.modalContent &&
            cloneElement(
              detailInfo.modalInfo.modalContent as React.ReactElement,
              { detail }
            )}
        </Form>
      </Modal>
    </>
  );
};

export default FilterTable;
