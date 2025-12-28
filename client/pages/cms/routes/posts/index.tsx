import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { Button, Table, Modal, Form, Input, Select, message, Space, Popconfirm } from 'antd'
import { FileTextOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { usePostStore } from 'client/stores'
import { useUserStore } from 'client/stores'
import * as styles from './styles.css'
import type { PostModelType } from 'client/stores/UserStore'

const { TextArea } = Input

const PostsPage = observer(() => {
  const postStore = usePostStore()
  const userStore = useUserStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<PostModelType | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    postStore.fetchPosts()
    userStore.fetchUsers()
  }, [])

  const handleCreate = () => {
    setEditingPost(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleEdit = (post: PostModelType) => {
    setEditingPost(post)
    form.setFieldsValue({
      title: post.title,
      content: post.content,
      authorId: post.authorId,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await postStore.deletePost(id)
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingPost) {
        await postStore.updatePostById(editingPost.id, {
          title: values.title,
          content: values.content,
        })
        message.success('更新成功')
      } else {
        await postStore.createPost({
          title: values.title,
          content: values.content,
          authorId: values.authorId,
        })
        message.success('创建成功')
      }
      setIsModalOpen(false)
      form.resetFields()
    } catch (error) {
      message.error(editingPost ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '摘要',
      key: 'excerpt',
      render: (_: any, record: PostModelType) => record.excerpt,
      ellipsis: true,
    },
    {
      title: '作者',
      key: 'authorName',
      render: (_: any, record: PostModelType) => record.authorName,
    },
    {
      title: '创建时间',
      key: 'formattedCreatedAt',
      render: (_: any, record: PostModelType) => record.formattedCreatedAt,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PostModelType) => (
        <Space>
          <Button type='link' icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title='确定要删除这篇文章吗？'
            onConfirm={() => handleDelete(record.id)}
            okText='确定'
            cancelText='取消'
          >
            <Button type='link' danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <FileTextOutlined /> 文章管理
        </h2>
        <Button type='primary' icon={<PlusOutlined />} onClick={handleCreate}>
          新建文章
        </Button>
      </div>

      {postStore.error && <div className={styles.error}>{postStore.error}</div>}

      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>总文章数：</span>
          <span className={styles.statValue}>{postStore.totalPosts}</span>
        </div>
        {postStore.latestPost && (
          <div className={styles.statItem}>
            <span className={styles.statLabel}>最新文章：</span>
            <span className={styles.statValue}>{postStore.latestPost.title}</span>
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={postStore.posts.slice()}
        rowKey='id'
        loading={postStore.loading}
        className={styles.table}
      />

      <Modal
        title={editingPost ? '编辑文章' : '新建文章'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        okText='确定'
        cancelText='取消'
        width={600}
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='title' label='标题' rules={[{ required: true, message: '请输入标题' }]}>
            <Input placeholder='请输入标题' />
          </Form.Item>
          <Form.Item name='content' label='内容' rules={[{ required: true, message: '请输入内容' }]}>
            <TextArea rows={6} placeholder='请输入内容' />
          </Form.Item>
          {!editingPost && (
            <Form.Item name='authorId' label='作者' rules={[{ required: true, message: '请选择作者' }]}>
              <Select
                placeholder='请选择作者'
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                options={userStore.users.map(user => ({
                  value: user.id,
                  label: user.displayName,
                }))}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
})

PostsPage.pageConfig = {
  name: '文章管理',
  order: 1,
  icon: <FileTextOutlined />,
}

export default PostsPage
