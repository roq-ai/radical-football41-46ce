import { useState } from 'react';
import AppLayout from 'layout/app-layout';
import Link from 'next/link';
import { Table, Thead, Tbody, Tr, Th, Td, TableContainer, Box, Text, Button } from '@chakra-ui/react';
import useSWR from 'swr';
import { Spinner } from '@chakra-ui/react';
import { getPlayers, deletePlayerById } from 'apiSdk/players';
import { PlayerInterface } from 'interfaces/player';
import { Error } from 'components/error';
import { AccessOperationEnum, AccessServiceEnum, useAuthorizationApi, withAuthorization } from '@roq/nextjs';

function PlayerListPage() {
  const { hasAccess } = useAuthorizationApi();
  const { data, error, isLoading, mutate } = useSWR<PlayerInterface[]>(
    () => '/players',
    () =>
      getPlayers({
        relations: [
          'user_player_user_idTouser',
          'academy',
          'user_player_coach_idTouser',
          'player_group.count',
          'training_plan.count',
        ],
      }),
  );

  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async (id: string) => {
    setDeleteError(null);
    try {
      await deletePlayerById(id);
      await mutate();
    } catch (error) {
      setDeleteError(error);
    }
  };

  return (
    <AppLayout>
      <Text as="h1" fontSize="2xl" fontWeight="bold">
        Player
      </Text>
      <Box bg="white" p={4} rounded="md" shadow="md">
        {hasAccess('player', AccessOperationEnum.CREATE, AccessServiceEnum.PROJECT) && (
          <Link href={`/players/create`}>
            <Button colorScheme="blue" mr="4">
              Create
            </Button>
          </Link>
        )}
        {error && <Error error={error} />}
        {deleteError && <Error error={deleteError} />}
        {isLoading ? (
          <Spinner />
        ) : (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>id</Th>
                  <Th>performance_data</Th>
                  <Th>development_goals</Th>
                  {hasAccess('user', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && <Th>user_id</Th>}
                  {hasAccess('academy', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && <Th>academy_id</Th>}
                  {hasAccess('user', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && <Th>coach_id</Th>}
                  {hasAccess('player_group', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                    <Th>player_group</Th>
                  )}
                  {hasAccess('training_plan', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                    <Th>training_plan</Th>
                  )}
                  {hasAccess('player', AccessOperationEnum.UPDATE, AccessServiceEnum.PROJECT) && <Th>Edit</Th>}
                  {hasAccess('player', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && <Th>View</Th>}
                  {hasAccess('player', AccessOperationEnum.DELETE, AccessServiceEnum.PROJECT) && <Th>Delete</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {data?.map((record) => (
                  <Tr key={record.id}>
                    <Td>{record.id}</Td>
                    <Td>{record.performance_data}</Td>
                    <Td>{record.development_goals}</Td>
                    {hasAccess('user_player_user_idTouser', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Link href={`/users/view/${record.user_player_user_idTouser?.id}`}>
                          {record.user_player_user_idTouser?.id}
                        </Link>
                      </Td>
                    )}
                    {hasAccess('academy', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Link href={`/academies/view/${record.academy?.id}`}>{record.academy?.id}</Link>
                      </Td>
                    )}
                    {hasAccess('user_player_coach_idTouser', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Link href={`/users/view/${record.user_player_coach_idTouser?.id}`}>
                          {record.user_player_coach_idTouser?.id}
                        </Link>
                      </Td>
                    )}
                    {hasAccess('player_group', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>{record?._count?.player_group}</Td>
                    )}
                    {hasAccess('training_plan', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>{record?._count?.training_plan}</Td>
                    )}
                    {hasAccess('player', AccessOperationEnum.UPDATE, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Link href={`/players/edit/${record.id}`} passHref legacyBehavior>
                          <Button as="a">Edit</Button>
                        </Link>
                      </Td>
                    )}
                    {hasAccess('player', AccessOperationEnum.READ, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Link href={`/players/view/${record.id}`} passHref legacyBehavior>
                          <Button as="a">View</Button>
                        </Link>
                      </Td>
                    )}
                    {hasAccess('player', AccessOperationEnum.DELETE, AccessServiceEnum.PROJECT) && (
                      <Td>
                        <Button onClick={() => handleDelete(record.id)}>Delete</Button>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </AppLayout>
  );
}
export default withAuthorization({
  service: AccessServiceEnum.PROJECT,
  entity: 'player',
  operation: AccessOperationEnum.READ,
})(PlayerListPage);
