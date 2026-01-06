import { Fragment, useRef } from 'react'
import { Button, Space } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'
import CommonTable, { CommonTableInstance } from 'client/components/CommonTable'
import { request } from 'client/api'
import CommonEditModal, { CommonEditModalInstance } from 'client/components/CommonEditModal'
import EasyModal from 'client/utils/easyModal'
import CommonConfirmModal from 'client/modals/CommonConfirmModal'
import { formatTime } from 'client/utils/time'
import { SchemaBase } from 'form-render'

const searchSchema: SchemaBase = {
  type: 'object',
  properties: {
    title: { type: 'string', title: '标题' },
    authorId: { type: 'number', title: '作者' },
  },
}

const postSchema: SchemaBase = {
  type: 'object',
  properties: {
    title: { type: 'string', title: '标题', required: true },
    content: { type: 'string', title: '内容', required: true },
    authorId: {
      type: 'number',
      title: '作者',
      widget: 'PageSelector',
      required: true,
      props: {
        url: request.users.get.url,
        labelKey: 'name',
        valueKey: 'id',
        allowClear: true,
      },
    },
  },
}
const PostsPage = () => {
  const modalRef = useRef<CommonEditModalInstance>(null)
  const tableRef = useRef<CommonTableInstance>(null)

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '摘要',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '作者',
      dataIndex: 'author',
      render: (_: any, record: any) => record.author?.name,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (createdAt: string) => formatTime(createdAt),
    },
    {
      title: '操作',
      dataIndex: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type='link' onClick={() => modalRef.current?.show(record)}>
            编辑
          </Button>

          <Button
            type='link'
            danger
            onClick={() =>
              EasyModal.show(CommonConfirmModal, {
                tip: '确定要$删除$这篇文章吗？',
                onOk: () => {
                  return request.posts.delete.params({ id: record.id }).then(() => {
                    tableRef.current?.fetchData()
                  })
                },
              })
            }
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleEdit = async (id: number, values: any) => {
    return request.posts.put
      .params({ id })
      .body(values)
      .then(() => {
        tableRef.current?.fetchData()
      })
  }

  const handleCreate = async (values: any) => {
    return request.posts.post.body(values).then(() => {
      tableRef.current?.fetchData()
    })
  }

  return (
    <Fragment>
      <CommonTable
        ref={tableRef}
        columns={columns}
        search={{ schema: searchSchema }}
        request={request.posts.get}
        extra={
          <Button type='primary' onClick={() => modalRef.current?.show(true)}>
            创建文章
          </Button>
        }
      />

      <CommonEditModal ref={modalRef} name='文章' schema={postSchema} onEdit={handleEdit} onCreate={handleCreate} />
    </Fragment>
  )
}

PostsPage.pageConfig = {
  name: '文章管理',
  order: 1,
  icon: <FileTextOutlined />,
}

export default PostsPage
